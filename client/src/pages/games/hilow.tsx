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
import { ArrowLeft, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

const CARD_NAMES = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["♠", "♥", "♦", "♣"];

function CardDisplay({ value, revealed, large }: { value: number; revealed: boolean; large?: boolean }) {
  const name = CARD_NAMES[value] || "?";
  const suit = SUITS[value % 4];
  const isRed = suit === "♥" || suit === "♦";

  return (
    <motion.div
      initial={revealed ? { rotateY: 180 } : {}}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.5 }}
      className={`${large ? "w-32 h-44" : "w-24 h-32"} rounded-xl border-2 flex flex-col items-center justify-center
        ${revealed ? "bg-white border-gray-300" : "gold-gradient border-primary/30"}`}
    >
      {revealed ? (
        <>
          <span className={`${large ? "text-3xl" : "text-2xl"} font-bold ${isRed ? "text-red-600" : "text-gray-900"}`}>{name}</span>
          <span className={`${large ? "text-2xl" : "text-xl"} ${isRed ? "text-red-600" : "text-gray-900"}`}>{suit}</span>
        </>
      ) : (
        <span className="text-2xl font-display text-background">?</span>
      )}
    </motion.div>
  );
}

export default function HiLowGame() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("10");
  const [currency] = useState("USDT");
  const [result, setResult] = useState<any>(null);
  const [streak, setStreak] = useState(0);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });
  const balance = wallets?.find(w => w.currency === currency)?.balance || 0;

  const playMutation = useMutation({
    mutationFn: async (prediction: string) => {
      const res = await apiRequest("POST", "/api/games/play", {
        gameSlug: "hilow", betAmount: parseFloat(betAmount), currency,
        gameData: { prediction },
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      if (data.correct) {
        setStreak(s => s + 1);
        toast({ title: `Correct! $${data.payout.toFixed(2)}`, description: `${data.multiplier}x — Streak: ${streak + 1}` });
      } else {
        setStreak(0);
        toast({ title: "Wrong!", description: `Card was ${CARD_NAMES[data.nextCard]}`, variant: "destructive" });
      }
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/casino">
        <span className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Casino
        </span>
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-2xl gold-text" data-testid="game-title">Hitide Lowtide</h1>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Hi-Low</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="glass-panel rounded-xl p-8">
          <div className="flex items-center justify-center gap-8">
            {/* Current card */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Current Card</p>
              <CardDisplay value={result?.currentCard || Math.ceil(Math.random() * 13)} revealed={!!result} large />
            </div>

            {/* Arrow */}
            <div className="text-3xl text-muted-foreground">→</div>

            {/* Next card */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Next Card</p>
              <CardDisplay value={result?.nextCard || 0} revealed={!!result && !!result.nextCard} large />
            </div>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
              <p className={`text-xl font-display ${result.correct ? "gold-text" : "text-red-500"}`} data-testid="hilow-result">
                {result.correct ? `Won $${result.payout.toFixed(2)} (${result.multiplier}x)` : "No Win"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {CARD_NAMES[result.currentCard]} → {CARD_NAMES[result.nextCard]}
              </p>
            </motion.div>
          )}

          {/* Prediction Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <Button
              className="w-36 h-16 bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
              disabled={!isAuthenticated || playMutation.isPending}
              onClick={() => playMutation.mutate("high")}
              data-testid="hilow-high-btn"
            >
              <ArrowUp className="w-6 h-6 mr-2" /> Higher
            </Button>
            <Button
              className="w-36 h-16 bg-red-600 hover:bg-red-700 text-white font-bold text-lg"
              disabled={!isAuthenticated || playMutation.isPending}
              onClick={() => playMutation.mutate("low")}
              data-testid="hilow-low-btn"
            >
              <ArrowDown className="w-6 h-6 mr-2" /> Lower
            </Button>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 space-y-4 h-fit">
          <div>
            <label className="text-xs text-muted-foreground">Balance ({currency})</label>
            <p className="text-lg font-bold gold-text" data-testid="hilow-balance">${balance.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Win Streak</label>
            <p className="text-lg font-bold text-foreground" data-testid="hilow-streak">{streak}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Bet Amount</label>
            <Input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
              className="bg-muted/50 border-border" data-testid="hilow-bet-input" min="1" />
          </div>
          <div className="flex gap-2">
            {[10, 25, 50, 100].map(v => (
              <Button key={v} variant="outline" size="sm" onClick={() => setBetAmount(v.toString())}
                className="border-primary/30 text-primary text-xs flex-1">${v}</Button>
            ))}
          </div>
          {!isAuthenticated && (
            <Link href="/auth">
              <Button className="w-full btn-casino" data-testid="hilow-login-btn">Login to Play</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
