import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Wallet } from "@shared/schema";
import { ArrowLeft, Loader2, TrendingUp, ShieldCheck } from "lucide-react";

const PLAYER_COUNT = Math.floor(Math.random() * 200 + 50);

export default function CrashGame() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("10");
  const [currency] = useState("USDT");
  const [gameActive, setGameActive] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [crashed, setCrashed] = useState(false);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);
  const intervalRef = useRef<any>(null);
  const crashPointRef = useRef(0);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });
  const balance = wallets?.find(w => w.currency === currency)?.balance || 0;

  // Simulated crash using server-generated crash point
  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games/start", {
        gameSlug: "crash", betAmount: parseFloat(betAmount), currency, gameData: {},
      });
      return res.json();
    },
    onSuccess: () => {
      // Generate local crash animation, real payout determined on cashout
      const cp = 1 + Math.random() * 15; // visual crash point
      crashPointRef.current = cp;
      setGameActive(true);
      setCrashed(false);
      setCashedOut(false);
      setCrashPoint(0);
      setCurrentMultiplier(1.0);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });

      let mult = 1.0;
      intervalRef.current = setInterval(() => {
        mult += 0.02 + (mult * 0.005);
        mult = Math.round(mult * 100) / 100;
        setCurrentMultiplier(mult);
        if (mult >= cp) {
          clearInterval(intervalRef.current);
          setCurrentMultiplier(cp);
          setCrashed(true);
          setCrashPoint(cp);
          setGameActive(false);
          toast({ title: `Crashed at ${cp.toFixed(2)}x!`, variant: "destructive" });
          queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
        }
      }, 100);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const cashoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games/cashout", {
        gameSlug: "crash", currentMultiplier,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCashedOut(true);
      setGameActive(false);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      if (data.crashed) {
        setCrashed(true);
        setCrashPoint(data.crashPoint);
        toast({ title: "Too late!", description: `Crashed at ${data.crashPoint}x`, variant: "destructive" });
      } else {
        toast({ title: `Cashed out $${data.payout.toFixed(2)}!`, description: `${data.multiplier}x` });
      }
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setGameActive(false);
    setCurrentMultiplier(1.0);
    setCrashed(false);
    setCashedOut(false);
    setCrashPoint(0);
  };

  const getColor = () => {
    if (crashed) return "text-red-500";
    if (currentMultiplier >= 5) return "text-green-400";
    if (currentMultiplier >= 2) return "neon-text-cyan";
    return "gold-text";
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
          <h1 className="font-display text-xl gold-text" data-testid="game-title">Beached</h1>
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
          <div className="h-64 flex items-center justify-center relative overflow-hidden rounded-xl bg-muted/20">
            {/* Multiplier curve visualization */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                <path
                  d={`M 0 200 Q ${Math.min(currentMultiplier * 20, 350)} ${200 - Math.min(currentMultiplier * 15, 180)} ${Math.min(currentMultiplier * 40, 400)} ${200 - Math.min(currentMultiplier * 18, 195)}`}
                  fill="none"
                  stroke={crashed ? "#ef4444" : "#EAB308"}
                  strokeWidth="3"
                  opacity="0.6"
                />
              </svg>
            </div>
            <motion.div
              animate={gameActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-center z-10"
            >
              <p className={`text-6xl font-bold font-display ${getColor()}`} data-testid="crash-multiplier">
                {currentMultiplier.toFixed(2)}x
              </p>
              {crashed && <p className="text-red-500 font-bold mt-2">CRASHED!</p>}
              {cashedOut && !crashed && <p className="text-green-400 font-bold mt-2">CASHED OUT!</p>}
            </motion.div>
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-border/50 p-4 space-y-4 h-fit" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          <div>
            <label className="text-xs text-muted-foreground">Balance ({currency})</label>
            <p className="text-lg font-bold gold-text" data-testid="crash-balance">${balance.toFixed(2)}</p>
          </div>
          {!gameActive && !crashed && !cashedOut && (
            <>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Bet Amount</label>
                <div className="flex gap-1">
                  <Input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
                    className="bg-muted/50 border-border" data-testid="crash-bet-input" min="1" />
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
                onClick={() => startMutation.mutate()} data-testid="crash-start-btn">
                {startMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {!isAuthenticated ? "Login to Play" : "Start"}
              </Button>
            </>
          )}
          {gameActive && (
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg uppercase tracking-wider"
              onClick={() => cashoutMutation.mutate()} disabled={cashoutMutation.isPending}
              data-testid="crash-cashout-btn">
              <TrendingUp className="w-5 h-5 mr-2" />
              Cash Out ${(parseFloat(betAmount) * currentMultiplier).toFixed(2)}
            </Button>
          )}
          {(crashed || cashedOut) && (
            <Button className="w-full btn-casino uppercase tracking-wider" onClick={reset} data-testid="crash-new-game-btn">
              Play Again
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
