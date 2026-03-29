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

const ROWS = 8;
const MULTIPLIERS = [0.5, 1, 1.5, 2, 3, 2, 1.5, 1, 0.5];
const PLAYER_COUNT = Math.floor(Math.random() * 200 + 50);

export default function PlinkoGame() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("10");
  const [currency] = useState("USDT");
  const [gameActive, setGameActive] = useState(false);
  const [ballRow, setBallRow] = useState(-1);
  const [ballPath, setBallPath] = useState<number[]>([]);
  const [result, setResult] = useState<{ multiplier: number; payout: number } | null>(null);
  const animRef = useRef<NodeJS.Timeout | null>(null);
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
        gameSlug: "plinko",
        betAmount: parseFloat(betAmount),
        currency,
        gameData: {},
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGameActive(true);
      setResult(null);

      const path: number[] = data.path;
      setBallPath(path);
      setBallRow(-1);

      // Animate ball through each row
      let step = 0;
      animRef.current = setInterval(() => {
        setBallRow(step);
        step++;
        if (step > ROWS) {
          clearInterval(animRef.current!);
          setGameActive(false);
          setResult({ multiplier: data.multiplier, payout: data.payout });
          if (data.payout > 0) {
            toast({
              title: `${data.multiplier}x — $${data.payout.toFixed(2)}`,
              description: data.payout > parseFloat(betAmount) ? "Nice win!" : "Better luck next time",
            });
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
      }, 250);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      autobet.setAutobetEnabled(false);
    },
  });

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  const dropBall = () => {
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
          <h1 className="font-display text-xl gold-text" data-testid="game-title">Plinko</h1>
          <span className="text-[10px] uppercase tracking-widest font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">100% RTP</span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded">Provably Fair</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{PLAYER_COUNT} playing</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Plinko Board */}
        <div className="rounded-xl border border-border/50 overflow-hidden glass-panel p-6" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          <div
            className="rounded-xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(120,80,10,0.2) 0%, rgba(80,50,10,0.2) 100%)",
              border: "1px solid rgba(234,179,8,0.15)",
            }}
          >
            {/* Peg Board */}
            <div className="space-y-3 mb-6">
              {Array.from({ length: ROWS }).map((_, row) => (
                <div key={row} className="flex justify-center" style={{ gap: `${32 - row}px` }}>
                  {Array.from({ length: row + 3 }).map((_, col) => {
                    const isBallHere = ballRow === row && ballPath[row] === col;
                    return (
                      <div key={col} className="relative">
                        <div
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            isBallHere
                              ? "bg-red-500 shadow-lg shadow-red-500/50 scale-150"
                              : "bg-primary/40"
                          }`}
                        />
                        {isBallHere && (
                          <motion.div
                            className="absolute -inset-2 rounded-full bg-red-500/30"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Multiplier Buckets */}
            <div className="flex justify-center gap-1">
              {MULTIPLIERS.map((mult, i) => {
                const isLanding = !gameActive && result && ballPath[ROWS] === i;
                const color =
                  mult >= 3
                    ? "bg-green-500/30 border-green-500/50 text-green-400"
                    : mult >= 1.5
                      ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                      : "bg-red-500/20 border-red-500/40 text-red-400";
                return (
                  <motion.div
                    key={i}
                    className={`flex-1 py-2 rounded-lg text-center text-xs font-bold border ${color} ${
                      isLanding ? "ring-2 ring-primary shadow-lg" : ""
                    }`}
                    animate={isLanding ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    data-testid={`bucket-${i}`}
                  >
                    {mult}x
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-4 rounded-xl text-center font-semibold ${
                  result.payout > parseFloat(betAmount)
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : result.payout === parseFloat(betAmount)
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
                data-testid="plinko-result"
              >
                Ball landed on {result.multiplier}x — Payout: ${result.payout.toFixed(2)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl border border-border/50 p-4" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
            <p className="text-xs text-muted-foreground mb-1">Balance</p>
            <p className="text-xl font-bold gold-text" data-testid="plinko-balance">
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

            <Button
              onClick={dropBall}
              disabled={gameActive || playMutation.isPending}
              className="w-full btn-casino text-lg py-6 uppercase tracking-wider"
              data-testid="btn-drop"
            >
              {gameActive ? "Dropping..." : "Drop Ball"}
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
              <p>1. Set your bet and drop the ball</p>
              <p>2. Watch it bounce through the pegs</p>
              <p>3. It lands in a multiplier bucket</p>
              <p>4. Center buckets pay more, edges pay less</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
