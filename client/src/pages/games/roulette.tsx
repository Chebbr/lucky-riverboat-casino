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
import { ArrowLeft, Loader2 } from "lucide-react";

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

export default function RouletteGame() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("10");
  const [currency] = useState("USDT");
  const [selectedBet, setSelectedBet] = useState<{ type: string; value?: string }>({ type: "red" });
  const [result, setResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });
  const balance = wallets?.find(w => w.currency === currency)?.balance || 0;

  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games/play", {
        gameSlug: "roulette", betAmount: parseFloat(betAmount), currency,
        gameData: { bets: [{ type: selectedBet.type, value: selectedBet.value, amount: parseFloat(betAmount) }] },
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSpinning(true);
      setTimeout(() => {
        setResult(data);
        setSpinning(false);
        queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
        if (data.payout > 0) {
          toast({ title: `WIN! $${data.payout.toFixed(2)}`, description: `Ball landed on ${data.number} ${data.color}` });
        }
      }, 2000);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const getNumberColor = (n: number) => n === 0 ? "bg-green-600" : RED_NUMBERS.includes(n) ? "bg-red-600" : "bg-gray-800";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/casino">
        <span className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Casino
        </span>
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-2xl gold-text" data-testid="game-title">Roulette</h1>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">100% RTP</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="glass-panel rounded-xl p-6">
          {/* Wheel Display */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={spinning ? { rotate: 1440 } : { rotate: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="w-48 h-48 rounded-full border-4 border-primary/30 flex items-center justify-center relative"
              style={{ background: "conic-gradient(from 0deg, #dc2626, #1f2937, #dc2626, #1f2937, #dc2626, #1f2937, #16a34a, #dc2626, #1f2937, #dc2626, #1f2937, #dc2626, #1f2937)" }}
            >
              <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center border border-primary/30">
                {result ? (
                  <span className={`text-2xl font-bold ${result.color === "red" ? "text-red-500" : result.color === "green" ? "text-green-500" : "text-white"}`}
                    data-testid="roulette-result-number">
                    {result.number}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-lg">?</span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Number Grid */}
          <div className="grid grid-cols-12 gap-1 mb-4">
            <button onClick={() => setSelectedBet({ type: "number", value: "0" })}
              className={`col-span-12 py-2 rounded text-xs font-bold ${selectedBet.type === "number" && selectedBet.value === "0" ? "ring-2 ring-primary" : ""} bg-green-600 text-white`}
              data-testid="roulette-number-0">
              0
            </button>
            {Array.from({ length: 36 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setSelectedBet({ type: "number", value: n.toString() })}
                className={`py-2 rounded text-xs font-bold ${getNumberColor(n)} text-white
                  ${selectedBet.type === "number" && selectedBet.value === n.toString() ? "ring-2 ring-primary" : ""}
                  ${result?.number === n ? "ring-2 ring-yellow-400 gold-glow" : ""}`}
                data-testid={`roulette-number-${n}`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Outside Bets */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {["1st12", "2nd12", "3rd12"].map(b => (
              <button key={b} onClick={() => setSelectedBet({ type: b })}
                className={`py-2 rounded text-xs font-bold bg-muted/50 text-foreground
                  ${selectedBet.type === b ? "ring-2 ring-primary bg-primary/20" : ""}`}
                data-testid={`roulette-bet-${b}`}>
                {b === "1st12" ? "1-12" : b === "2nd12" ? "13-24" : "25-36"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {[
              { type: "red", label: "Red", color: "bg-red-600" },
              { type: "black", label: "Black", color: "bg-gray-800" },
              { type: "odd", label: "Odd", color: "bg-muted/50" },
              { type: "even", label: "Even", color: "bg-muted/50" },
              { type: "1-18", label: "1-18", color: "bg-muted/50" },
              { type: "19-36", label: "19-36", color: "bg-muted/50" },
            ].map(b => (
              <button key={b.type} onClick={() => setSelectedBet({ type: b.type })}
                className={`py-2 rounded text-xs font-bold ${b.color} text-white
                  ${selectedBet.type === b.type ? "ring-2 ring-primary" : ""}`}
                data-testid={`roulette-bet-${b.type}`}>
                {b.label}
              </button>
            ))}
          </div>

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
              <p className="text-lg font-display" data-testid="roulette-result">
                <span className={result.color === "red" ? "text-red-500" : result.color === "green" ? "text-green-500" : "text-white"}>
                  {result.number} {result.color}
                </span>
                {" — "}
                <span className={result.payout > 0 ? "gold-text" : "text-muted-foreground"}>
                  {result.payout > 0 ? `Won $${result.payout.toFixed(2)}` : "No Win"}
                </span>
              </p>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="glass-panel rounded-xl p-4 space-y-4 h-fit">
          <div>
            <label className="text-xs text-muted-foreground">Balance ({currency})</label>
            <p className="text-lg font-bold gold-text" data-testid="roulette-balance">${balance.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Current Bet</label>
            <p className="text-sm text-foreground capitalize">{selectedBet.type}{selectedBet.value ? `: ${selectedBet.value}` : ""}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Bet Amount</label>
            <Input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
              className="bg-muted/50 border-border" data-testid="roulette-bet-input" min="1" />
          </div>
          <div className="flex gap-2">
            {[10, 25, 50, 100].map(v => (
              <Button key={v} variant="outline" size="sm" onClick={() => setBetAmount(v.toString())}
                className="border-primary/30 text-primary text-xs flex-1">${v}</Button>
            ))}
          </div>
          <Button className="w-full btn-casino" disabled={!isAuthenticated || spinning || playMutation.isPending}
            onClick={() => playMutation.mutate()} data-testid="roulette-spin-btn">
            {spinning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {!isAuthenticated ? "Login to Play" : spinning ? "Spinning..." : "Spin"}
          </Button>
        </div>
      </div>
    </div>
  );
}
