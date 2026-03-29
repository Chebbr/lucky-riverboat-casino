import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Wallet } from "@shared/schema";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AutobetPanel, useAutobet } from "@/components/autobet-panel";

const symbols = ["🍒", "🍊", "🍋", "🔔", "⭐", "💎", "7️⃣"];

const payouts: Record<string, number> = {
  "🍒🍒🍒": 2,
  "🍊🍊🍊": 3,
  "🍋🍋🍋": 4,
  "🔔🔔🔔": 5,
  "⭐⭐⭐": 10,
  "💎💎💎": 25,
  "7️⃣7️⃣7️⃣": 100,
};

const payoutTable = [
  { combo: "🍒🍒🍒", name: "Cherry", mult: "2x" },
  { combo: "🍊🍊🍊", name: "Orange", mult: "3x" },
  { combo: "🍋🍋🍋", name: "Lemon", mult: "4x" },
  { combo: "🔔🔔🔔", name: "Bell", mult: "5x" },
  { combo: "⭐⭐⭐", name: "Star", mult: "10x" },
  { combo: "💎💎💎", name: "Diamond", mult: "25x" },
  { combo: "7️⃣7️⃣7️⃣", name: "Lucky Seven", mult: "100x" },
];

const PLAYER_COUNT = Math.floor(Math.random() * 200 + 50);

export default function SlotsGame() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("10");
  const [currency] = useState("USDT");
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(["🍒", "🍒", "🍒"]);
  const [result, setResult] = useState<string | null>(null);
  const [payout, setPayout] = useState(0);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autobet = useAutobet();
  const autobetTimeoutRef = useRef<any>(null);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });
  const balance = wallets?.find((w) => w.currency === currency)?.balance || 0;

  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games/play", {
        gameSlug: "slots",
        betAmount: parseFloat(betAmount),
        currency,
        gameData: {},
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Start animation, then show result
      setSpinning(true);
      setResult(null);
      setPayout(0);

      let spins = 0;
      spinIntervalRef.current = setInterval(() => {
        setReels([
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
        ]);
        spins++;
        if (spins >= 20) {
          clearInterval(spinIntervalRef.current!);
          // Set final reels from server result
          setReels(data.finalReels);
          setSpinning(false);
          setPayout(data.payout);
          if (data.payout > 0) {
            setResult(`${data.finalReels.join(" ")} — Winner!`);
            toast({
              title: `WIN! $${data.payout.toFixed(2)}`,
              description: `${data.multiplier}x multiplier`,
            });
          } else {
            setResult(`${data.finalReels.join(" ")} — No match`);
          }
          queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
          // Autobet
          autobet.handleBetResult({ won: data.payout > 0, payout: data.payout, betAmount: parseFloat(betAmount) });
          autobet.decrementBets();
          if (autobet.shouldContinue()) {
            autobetTimeoutRef.current = setTimeout(() => {
              if (autobet.shouldContinue()) playMutation.mutate();
            }, 1500);
          } else {
            autobet.setAutobetEnabled(false);
          }
        }
      }, 80);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      autobet.setAutobetEnabled(false);
    },
  });

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const spin = () => {
    if (!isAuthenticated) {
      toast({ title: "Login required", variant: "destructive" });
      return;
    }
    playMutation.mutate();
  };

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
          <h1 className="font-display text-xl gold-text" data-testid="game-title">Slots</h1>
          <span className="text-[10px] uppercase tracking-widest font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">100% RTP</span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded">Provably Fair</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{PLAYER_COUNT} playing</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Slot Machine */}
        <div className="rounded-xl border border-border/50 overflow-hidden glass-panel p-6" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          <div
            className="rounded-xl p-8"
            style={{
              background: "linear-gradient(135deg, rgba(120,30,30,0.3) 0%, rgba(80,10,10,0.3) 100%)",
              border: "1px solid rgba(234,179,8,0.2)",
            }}
          >
            {/* Reel Display */}
            <div className="flex justify-center gap-4 mb-8">
              {reels.map((symbol, i) => (
                <motion.div
                  key={i}
                  animate={spinning ? { y: [0, -10, 0, 10, 0] } : { y: 0 }}
                  transition={spinning ? { duration: 0.15, repeat: Infinity } : {}}
                  className="w-28 h-28 rounded-xl flex items-center justify-center text-6xl shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(202,138,4,0.3) 0%, rgba(234,179,8,0.15) 100%)",
                    border: "3px solid rgba(234,179,8,0.4)",
                    boxShadow: spinning
                      ? "0 0 20px rgba(234,179,8,0.3)"
                      : payout > 0
                        ? "0 0 30px rgba(34,197,94,0.4)"
                        : "0 0 10px rgba(234,179,8,0.1)",
                  }}
                  data-testid={`reel-${i}`}
                >
                  {symbol}
                </motion.div>
              ))}
            </div>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl text-center font-semibold ${
                    payout > 0
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                  data-testid="slots-result"
                >
                  {result}
                  {payout > 0 && (
                    <p className="text-sm mt-1 opacity-80">Payout: ${payout.toFixed(2)}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payout Table */}
          <div className="mt-4 glass-panel rounded-xl p-4">
            <h3 className="text-sm font-semibold gold-text mb-3">Payouts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {payoutTable.map((p) => (
                <div
                  key={p.combo}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 text-xs"
                >
                  <span>{p.combo}</span>
                  <span className="font-bold gold-text">{p.mult}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl border border-border/50 p-4" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
            <p className="text-xs text-muted-foreground mb-1">Balance</p>
            <p className="text-xl font-bold gold-text" data-testid="slots-balance">
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
                  disabled={spinning}
                  className="bg-muted/50"
                  data-testid="input-bet"
                />
                <Button variant="outline" size="sm" onClick={half} disabled={spinning} className="border-border text-muted-foreground px-2 shrink-0">½</Button>
                <Button variant="outline" size="sm" onClick={double} disabled={spinning} className="border-border text-muted-foreground px-2 shrink-0">2×</Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[5, 10, 25, 50, 100, 250].map((v) => (
                <Button
                  key={v}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(v.toString())}
                  disabled={spinning}
                  className="text-xs border-primary/30 text-primary"
                  data-testid={`btn-bet-${v}`}
                >
                  ${v}
                </Button>
              ))}
            </div>

            <Button
              onClick={spin}
              disabled={spinning || playMutation.isPending}
              className="w-full btn-casino text-lg py-6 uppercase tracking-wider"
              data-testid="btn-spin"
            >
              {spinning ? "Spinning..." : "SPIN"}
            </Button>
            <AutobetPanel autobetState={autobet.autobetState} onChange={autobet.patchState} />
            <div className="pt-2 border-t border-border/50 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-primary/50" />
              <span className="text-[10px] text-primary/50 uppercase tracking-widest">Provably Fair</span>
            </div>
          </div>

          <div className="glass-panel rounded-xl border border-border/50 p-4" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
            <h3 className="text-sm font-semibold gold-text mb-2">How to Play</h3>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p>1. Set your bet amount and hit SPIN</p>
              <p>2. Match three symbols to win</p>
              <p>3. Higher-value symbols pay more</p>
              <p>4. Lucky 7s pay 100x your bet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
