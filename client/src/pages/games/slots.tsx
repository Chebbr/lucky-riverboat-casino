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
import { ArrowLeft } from "lucide-react";

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
        }
      }, 80);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/casino">
        <span className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 cursor-pointer" data-testid="back-to-casino">
          <ArrowLeft className="w-4 h-4" /> Back to Casino
        </span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-2xl gold-text" data-testid="game-title">Slots</h1>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">100% RTP</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Slot Machine */}
        <div className="glass-panel rounded-xl p-6">
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
          <div className="glass-panel rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Balance</p>
            <p className="text-xl font-bold gold-text" data-testid="slots-balance">
              ${balance.toFixed(2)}
            </p>
          </div>

          <div className="glass-panel rounded-xl p-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Bet Amount</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="1"
                disabled={spinning}
                className="mt-1 bg-muted/50"
                data-testid="input-bet"
              />
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[5, 10, 25, 50].map((v) => (
                <Button
                  key={v}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(v.toString())}
                  disabled={spinning}
                  className="text-xs"
                  data-testid={`btn-bet-${v}`}
                >
                  ${v}
                </Button>
              ))}
            </div>

            <Button
              onClick={spin}
              disabled={spinning || playMutation.isPending}
              className="w-full btn-casino text-lg py-6"
              data-testid="btn-spin"
            >
              {spinning ? "Spinning..." : "SPIN"}
            </Button>
          </div>

          <div className="glass-panel rounded-xl p-4">
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
