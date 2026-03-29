import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Wallet } from "@shared/schema";
import { ArrowLeft, Loader2, Gem, Bomb, ShieldCheck } from "lucide-react";

const PLAYER_COUNT = Math.floor(Math.random() * 200 + 50);

export default function MinesGame() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("10");
  const [currency] = useState("USDT");
  const [mineCount, setMineCount] = useState(3);
  const [gameActive, setGameActive] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [mines, setMines] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });
  const balance = wallets?.find(w => w.currency === currency)?.balance || 0;

  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games/start", {
        gameSlug: "mines", betAmount: parseFloat(betAmount), currency,
        gameData: { mineCount },
      });
      return res.json();
    },
    onSuccess: () => {
      setGameActive(true);
      setRevealed([]);
      setMines([]);
      setMultiplier(1);
      setGameOver(false);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const revealMutation = useMutation({
    mutationFn: async (tileIndex: number) => {
      const res = await apiRequest("POST", "/api/games/reveal", { gameSlug: "mines", tileIndex });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.hit) {
        setMines(data.mines);
        setGameOver(true);
        setGameActive(false);
        toast({ title: "BOOM!", description: "You hit a mine!", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      } else {
        setRevealed(data.revealed);
        setMultiplier(data.multiplier);
      }
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const cashoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games/cashout", { gameSlug: "mines" });
      return res.json();
    },
    onSuccess: (data) => {
      setGameActive(false);
      setGameOver(true);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      toast({ title: `Cashed out! $${data.payout.toFixed(2)}`, description: `${data.multiplier}x multiplier` });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleTileClick = (idx: number) => {
    if (!gameActive || revealed.includes(idx) || revealMutation.isPending) return;
    revealMutation.mutate(idx);
  };

  const reset = () => {
    setGameActive(false);
    setRevealed([]);
    setMines([]);
    setMultiplier(1);
    setGameOver(false);
  };

  const half = () => setBetAmount(v => Math.max(1, parseFloat(v) / 2).toFixed(2));
  const double = () => setBetAmount(v => (parseFloat(v) * 2).toFixed(2));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/casino">
            <Button variant="ghost" size="sm" data-testid="back-btn"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="font-display text-xl gold-text" data-testid="game-title">Hidden Treasure</h1>
          <span className="text-[10px] uppercase tracking-widest font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">100% RTP</span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded">Provably Fair</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{PLAYER_COUNT} playing</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="rounded-xl border border-border/50 overflow-hidden glass-panel p-6" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            {Array.from({ length: 25 }, (_, i) => {
              const isRevealed = revealed.includes(i);
              const isMine = mines.includes(i);
              return (
                <motion.button
                  key={i}
                  whileTap={gameActive ? { scale: 0.9 } : {}}
                  onClick={() => handleTileClick(i)}
                  data-testid={`mines-tile-${i}`}
                  className={`aspect-square rounded-xl text-lg font-bold flex items-center justify-center transition-all
                    ${isMine ? "bg-red-500/80 text-white" :
                      isRevealed ? "bg-green-500/80 text-white gold-glow" :
                      gameActive ? "bg-muted/60 hover:bg-muted cursor-pointer" :
                      "bg-muted/30 cursor-default"
                    }`}
                >
                  {isMine ? <Bomb className="w-6 h-6" /> :
                   isRevealed ? <Gem className="w-6 h-6" /> :
                   gameActive ? "?" : ""}
                </motion.button>
              );
            })}
          </div>

          {gameActive && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
              <p className="text-lg gold-text font-display" data-testid="mines-multiplier">{multiplier}x</p>
              <p className="text-xs text-muted-foreground">
                Potential win: ${(parseFloat(betAmount) * multiplier).toFixed(2)}
              </p>
            </motion.div>
          )}
        </div>

        <div className="glass-panel rounded-xl border border-border/50 p-4 space-y-4 h-fit" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          <div>
            <label className="text-xs text-muted-foreground">Balance ({currency})</label>
            <p className="text-lg font-bold gold-text" data-testid="mines-balance">${balance.toFixed(2)}</p>
          </div>
          {!gameActive && (
            <>
              <div>
                <label className="text-xs text-muted-foreground">Mines (1-24)</label>
                <Input type="number" value={mineCount} onChange={e => setMineCount(Math.min(24, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="bg-muted/50 border-border" data-testid="mines-count-input" min="1" max="24" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Bet Amount</label>
                <div className="flex gap-1">
                  <Input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
                    className="bg-muted/50 border-border" data-testid="mines-bet-input" min="1" />
                  <Button variant="outline" size="sm" onClick={half} className="border-border text-muted-foreground px-2 shrink-0">½</Button>
                  <Button variant="outline" size="sm" onClick={double} className="border-border text-muted-foreground px-2 shrink-0">2×</Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[5, 10, 25, 50, 100, 250].map(v => (
                  <Button key={v} variant="outline" size="sm" onClick={() => setBetAmount(v.toString())}
                    className="border-primary/30 text-primary text-xs">${v}</Button>
                ))}
              </div>
              <Button className="w-full btn-casino uppercase tracking-wider" disabled={!isAuthenticated || startMutation.isPending}
                onClick={() => startMutation.mutate()} data-testid="mines-start-btn">
                {startMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {!isAuthenticated ? "Login to Play" : "Start Game"}
              </Button>
            </>
          )}
          {gameActive && (
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider"
              onClick={() => cashoutMutation.mutate()} disabled={revealed.length === 0 || cashoutMutation.isPending}
              data-testid="mines-cashout-btn">
              Cash Out ${(parseFloat(betAmount) * multiplier).toFixed(2)}
            </Button>
          )}
          {gameOver && !gameActive && (
            <Button className="w-full btn-casino uppercase tracking-wider" onClick={reset} data-testid="mines-new-game-btn">
              New Game
            </Button>
          )}
          <div className="pt-2 border-t border-border/50 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-primary/50" />
            <span className="text-[10px] text-primary/50 uppercase tracking-widest">Provably Fair</span>
          </div>
        </div>
      </div>
    </div>
  );
}
