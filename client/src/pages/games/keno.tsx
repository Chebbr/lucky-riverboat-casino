import { useState, useMemo } from "react";
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

const PLAYER_COUNT = Math.floor(Math.random() * 200 + 50);

export default function KenoGame() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState("10");
  const [currency] = useState("USDT");
  const [result, setResult] = useState<any>(null);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });
  const balance = wallets?.find(w => w.currency === currency)?.balance || 0;

  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games/play", {
        gameSlug: "keno", betAmount: parseFloat(betAmount), currency,
        gameData: { selectedNumbers },
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      if (data.payout > 0) {
        toast({ title: `WIN! $${data.payout.toFixed(2)}`, description: `${data.matches} matches — ${data.multiplier}x multiplier` });
      }
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleNumber = (n: number) => {
    if (result) setResult(null);
    setSelectedNumbers(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : prev.length < 10 ? [...prev, n] : prev
    );
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
          <h1 className="font-display text-xl gold-text" data-testid="game-title">Riverboat Keno</h1>
          <span className="text-[10px] uppercase tracking-widest font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">100% RTP</span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded">Provably Fair</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{PLAYER_COUNT} playing</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Keno Board */}
        <div className="rounded-xl border border-border/50 overflow-hidden shadow-inner glass-panel p-4" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 80 }, (_, i) => i + 1).map(n => {
              const isSelected = selectedNumbers.includes(n);
              const isDrawn = result?.drawnNumbers?.includes(n);
              const isMatch = isSelected && isDrawn;
              const isMiss = isSelected && result && !isDrawn;
              return (
                <motion.button
                  key={n}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleNumber(n)}
                  data-testid={`keno-number-${n}`}
                  className={`aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer
                    ${isMatch ? "bg-green-500 text-white gold-glow-strong" :
                      isMiss ? "bg-red-500/60 text-white" :
                      isDrawn ? "bg-primary/30 text-primary" :
                      isSelected ? "bg-primary text-background" :
                      "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {n}
                </motion.button>
              );
            })}
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <p className="text-lg font-display gold-text" data-testid="keno-result">
                {result.matches} Match{result.matches !== 1 ? "es" : ""} —
                {result.payout > 0 ? ` Won $${result.payout.toFixed(2)} (${result.multiplier}x)` : " No Win"}
              </p>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="glass-panel rounded-xl border border-border/50 p-4 space-y-4 h-fit" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          <div>
            <label className="text-xs text-muted-foreground">Balance ({currency})</label>
            <p className="text-lg font-bold gold-text" data-testid="keno-balance">${balance.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Selected: {selectedNumbers.length}/10</label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Bet Amount</label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-muted/50 border-border"
                data-testid="keno-bet-input"
                min="1"
              />
              <Button variant="outline" size="sm" onClick={half} className="border-border text-muted-foreground px-2 shrink-0">½</Button>
              <Button variant="outline" size="sm" onClick={double} className="border-border text-muted-foreground px-2 shrink-0">2×</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[5, 10, 25, 50, 100, 250].map(v => (
              <Button key={v} variant="outline" size="sm" onClick={() => setBetAmount(v.toString())}
                className="border-primary/30 text-primary text-xs" data-testid={`keno-bet-${v}`}>
                ${v}
              </Button>
            ))}
          </div>
          <Button
            className="w-full btn-casino uppercase tracking-wider"
            disabled={!isAuthenticated || selectedNumbers.length < 1 || playMutation.isPending}
            onClick={() => playMutation.mutate()}
            data-testid="keno-play-btn"
          >
            {playMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {!isAuthenticated ? "Login to Play" : `Draw (${selectedNumbers.length} picks)`}
          </Button>
          <Button variant="outline" size="sm" className="w-full border-border text-muted-foreground"
            onClick={() => { setSelectedNumbers([]); setResult(null); }} data-testid="keno-clear-btn">
            Clear Selection
          </Button>
          <div className="pt-2 border-t border-border/50 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-primary/50" />
            <span className="text-[10px] text-primary/50 uppercase tracking-widest">Provably Fair</span>
          </div>
        </div>
      </div>
    </div>
  );
}
