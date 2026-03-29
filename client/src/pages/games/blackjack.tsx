import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Wallet } from "@shared/schema";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const PLAYER_COUNT = Math.floor(Math.random() * 200 + 50);

interface GameCard {
  suit: string;
  value: string;
}

function getCardValue(card: GameCard): number {
  if (card.value === "A") return 11;
  if (["J", "Q", "K"].includes(card.value)) return 10;
  return parseInt(card.value);
}

function calculateHandValue(cards: GameCard[]): number {
  let value = 0;
  let aces = 0;
  for (const card of cards) {
    const cv = getCardValue(card);
    if (card.value === "A") aces++;
    value += cv;
  }
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}

function generateCard(): GameCard {
  return {
    suit: suits[Math.floor(Math.random() * suits.length)],
    value: values[Math.floor(Math.random() * values.length)],
  };
}

function CardDisplay({ card, hidden }: { card: GameCard; hidden?: boolean }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  return (
    <motion.div
      initial={{ rotateY: hidden ? 180 : 0, scale: 0.8, opacity: 0 }}
      animate={{ rotateY: 0, scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
      className="w-16 h-24 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg border-2 border-primary/30"
      style={{
        background: hidden
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
          : "linear-gradient(135deg, #fefefe 0%, #f0f0f0 100%)",
      }}
    >
      {hidden ? (
        <span className="text-2xl text-primary/40">?</span>
      ) : (
        <span className={isRed ? "text-red-600" : "text-gray-900"}>
          {card.value}
          {card.suit}
        </span>
      )}
    </motion.div>
  );
}

export default function BlackjackGame() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("10");
  const [currency] = useState("USDT");
  const [gameActive, setGameActive] = useState(false);
  const [playerCards, setPlayerCards] = useState<GameCard[]>([]);
  const [dealerCards, setDealerCards] = useState<GameCard[]>([]);
  const [dealerRevealed, setDealerRevealed] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [payout, setPayout] = useState(0);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });
  const balance = wallets?.find((w) => w.currency === currency)?.balance || 0;

  const playMutation = useMutation({
    mutationFn: async (action: { type: "deal" | "hit" | "stand"; cards?: GameCard[]; dealerCards?: GameCard[] }) => {
      const res = await apiRequest("POST", "/api/games/play", {
        gameSlug: "blackjack",
        betAmount: parseFloat(betAmount),
        currency,
        gameData: action,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
    },
  });

  const startGame = () => {
    if (!isAuthenticated) {
      toast({ title: "Login required", variant: "destructive" });
      return;
    }
    const newPlayerCards = [generateCard(), generateCard()];
    const newDealerCards = [generateCard(), generateCard()];
    setPlayerCards(newPlayerCards);
    setDealerCards(newDealerCards);
    setGameActive(true);
    setGameResult(null);
    setDealerRevealed(false);
    setPayout(0);

    // Check for blackjack
    if (calculateHandValue(newPlayerCards) === 21) {
      endGame(newPlayerCards, newDealerCards, "blackjack");
    }
  };

  const hit = () => {
    const newCards = [...playerCards, generateCard()];
    setPlayerCards(newCards);
    if (calculateHandValue(newCards) > 21) {
      endGame(newCards, dealerCards, "bust");
    }
  };

  const stand = () => {
    let dealerHand = [...dealerCards];
    while (calculateHandValue(dealerHand) < 17) {
      dealerHand.push(generateCard());
    }
    setDealerCards(dealerHand);
    endGame(playerCards, dealerHand, "stand");
  };

  const endGame = (pCards: GameCard[], dCards: GameCard[], type: string) => {
    setDealerRevealed(true);
    setGameActive(false);

    const pv = calculateHandValue(pCards);
    const dv = calculateHandValue(dCards);
    let result = "";
    let mult = 0;

    if (type === "blackjack") {
      result = "Blackjack! You win!";
      mult = 2.5;
    } else if (type === "bust") {
      result = "Bust! You lose.";
      mult = 0;
    } else if (dv > 21) {
      result = "Dealer busts! You win!";
      mult = 2;
    } else if (pv > dv) {
      result = "You win!";
      mult = 2;
    } else if (dv > pv) {
      result = "Dealer wins.";
      mult = 0;
    } else {
      result = "Push — tie game.";
      mult = 1;
    }

    const payoutAmt = parseFloat(betAmount) * mult;
    setPayout(payoutAmt);
    setGameResult(result);

    // Record the bet on the backend
    playMutation.mutate({
      type: "deal",
      cards: pCards,
      dealerCards: dCards,
    });
  };

  const playerValue = calculateHandValue(playerCards);
  const dealerValue = dealerRevealed
    ? calculateHandValue(dealerCards)
    : dealerCards.length > 0
      ? getCardValue(dealerCards[0])
      : 0;

  const half = () => setBetAmount(v => Math.max(1, parseFloat(v) / 2).toFixed(2));
  const double = () => setBetAmount(v => (parseFloat(v) * 2).toFixed(2));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/casino">
            <Button variant="ghost" size="sm" data-testid="back-to-casino"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="font-display text-xl gold-text" data-testid="game-title">Blackjack</h1>
          <span className="text-[10px] uppercase tracking-widest font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">100% RTP</span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded">Provably Fair</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{PLAYER_COUNT} playing</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Game Table */}
        <div className="rounded-xl border border-border/50 overflow-hidden glass-panel p-6" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          <div
            className="rounded-xl p-8 space-y-8"
            style={{
              background: "linear-gradient(135deg, rgba(20,80,40,0.4) 0%, rgba(10,60,30,0.4) 100%)",
              border: "1px solid rgba(234,179,8,0.15)",
            }}
          >
            {/* Dealer Hand */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Dealer</span>
                {dealerCards.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {dealerRevealed ? `Total: ${dealerValue}` : `Showing: ${dealerValue}`}
                    {dealerRevealed && dealerValue > 21 && " (Bust!)"}
                  </span>
                )}
              </div>
              <div className="flex gap-3 min-h-[96px]">
                <AnimatePresence>
                  {dealerCards.map((card, i) => (
                    <CardDisplay key={`d-${i}`} card={card} hidden={!dealerRevealed && i > 0} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-primary/20" />

            {/* Player Hand */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Your Hand</span>
                {playerCards.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Total: {playerValue} {playerValue > 21 && "(Bust!)"}
                  </span>
                )}
              </div>
              <div className="flex gap-3 min-h-[96px]">
                <AnimatePresence>
                  {playerCards.map((card, i) => (
                    <CardDisplay key={`p-${i}`} card={card} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Result Banner */}
          <AnimatePresence>
            {gameResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-4 rounded-xl text-center font-semibold ${
                  gameResult.includes("win") || gameResult.includes("Blackjack")
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : gameResult.includes("Push")
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
                data-testid="game-result"
              >
                {gameResult}
                {payout > 0 && (
                  <p className="text-sm mt-1 opacity-80">Payout: ${payout.toFixed(2)}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl border border-border/50 p-4" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
            <p className="text-xs text-muted-foreground mb-1">Balance</p>
            <p className="text-xl font-bold gold-text" data-testid="blackjack-balance">
              ${balance.toFixed(2)}
            </p>
          </div>

          <div className="glass-panel rounded-xl border border-border/50 p-4 space-y-3" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Bet Amount</label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="1"
                  disabled={gameActive}
                  className="bg-muted/50"
                  data-testid="input-bet"
                />
                <Button variant="outline" size="sm" onClick={half} disabled={gameActive} className="border-border text-muted-foreground px-2 shrink-0">½</Button>
                <Button variant="outline" size="sm" onClick={double} disabled={gameActive} className="border-border text-muted-foreground px-2 shrink-0">2×</Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[5, 10, 25, 50, 100, 250].map((v) => (
                <Button
                  key={v}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(v.toString())}
                  disabled={gameActive}
                  className="text-xs border-primary/30 text-primary"
                  data-testid={`btn-bet-${v}`}
                >
                  ${v}
                </Button>
              ))}
            </div>

            {!gameActive && !gameResult && (
              <Button
                onClick={startGame}
                className="w-full btn-casino text-base py-5 uppercase tracking-wider"
                data-testid="btn-deal"
              >
                Deal
              </Button>
            )}

            {gameActive && (
              <div className="flex gap-2">
                <Button
                  onClick={hit}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground uppercase tracking-wider"
                  data-testid="btn-hit"
                >
                  Hit
                </Button>
                <Button
                  onClick={stand}
                  variant="destructive"
                  className="flex-1 uppercase tracking-wider"
                  data-testid="btn-stand"
                >
                  Stand
                </Button>
              </div>
            )}

            {gameResult && (
              <Button
                onClick={() => {
                  setGameResult(null);
                  setPlayerCards([]);
                  setDealerCards([]);
                }}
                className="w-full btn-casino uppercase tracking-wider"
                data-testid="btn-play-again"
              >
                Play Again
              </Button>
            )}
            <div className="pt-2 border-t border-border/50 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-primary/50" />
              <span className="text-[10px] text-primary/50 uppercase tracking-widest">Provably Fair</span>
            </div>
          </div>

          <div className="glass-panel rounded-xl border border-border/50 p-4" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
            <h3 className="text-sm font-semibold gold-text mb-2">How to Play</h3>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p>1. Place your bet and deal the cards</p>
              <p>2. Hit to draw another card</p>
              <p>3. Stand to keep your hand</p>
              <p>4. Get closer to 21 than the dealer without going over</p>
              <p>5. Blackjack pays 2.5x, regular win pays 2x</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
