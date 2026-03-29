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
import { ArrowLeft, Loader2, Skull, CheckCircle2, ShieldCheck } from "lucide-react";

const PLAYER_COUNT = Math.floor(Math.random() * 200 + 50);

export default function TowerGame() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("10");
  const [currency] = useState("USDT");
  const [gameActive, setGameActive] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [choices, setChoices] = useState<number[]>([]);
  const [allSafeTiles, setAllSafeTiles] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [failedLevel, setFailedLevel] = useState(-1);
  const [failedTile, setFailedTile] = useState(-1);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });
  const balance = wallets?.find(w => w.currency === currency)?.balance || 0;

  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games/start", {
        gameSlug: "tower", betAmount: parseFloat(betAmount), currency, gameData: {},
      });
      return res.json();
    },
    onSuccess: () => {
      setGameActive(true);
      setCurrentLevel(0);
      setMultiplier(1);
      setChoices([]);
      setAllSafeTiles([]);
      setGameOver(false);
      setFailedLevel(-1);
      setFailedTile(-1);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const revealMutation = useMutation({
    mutationFn: async (tileChoice: number) => {
      const res = await apiRequest("POST", "/api/games/reveal", { gameSlug: "tower", tileChoice });
      return res.json();
    },
    onSuccess: (data, tileChoice) => {
      if (!data.safe) {
        setFailedLevel(currentLevel);
        setFailedTile(tileChoice);
        setAllSafeTiles(data.allSafeTiles || []);
        setGameActive(false);
        setGameOver(true);
        toast({ title: "Fell off the plank!", description: "Better luck next time", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      } else {
        setChoices(prev => [...prev, tileChoice]);
        setCurrentLevel(data.currentLevel);
        setMultiplier(data.multiplier);
        if (data.completed) {
          setGameActive(false);
          setGameOver(true);
          toast({ title: `Top reached! $${data.payout.toFixed(2)}`, description: `${data.multiplier}x multiplier!` });
          queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
        }
      }
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const cashoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games/cashout", { gameSlug: "tower" });
      return res.json();
    },
    onSuccess: (data) => {
      setGameActive(false);
      setGameOver(true);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      toast({ title: `Cashed out $${data.payout.toFixed(2)}!`, description: `${data.multiplier}x` });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const reset = () => {
    setGameActive(false);
    setCurrentLevel(0);
    setMultiplier(1);
    setChoices([]);
    setAllSafeTiles([]);
    setGameOver(false);
    setFailedLevel(-1);
    setFailedTile(-1);
  };

  const half = () => setBetAmount(v => Math.max(1, parseFloat(v) / 2).toFixed(2));
  const double = () => setBetAmount(v => (parseFloat(v) * 2).toFixed(2));

  const levels = Array.from({ length: 8 }, (_, i) => 7 - i); // top to bottom

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/casino">
            <Button variant="ghost" size="sm" data-testid="back-btn"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="font-display text-xl gold-text" data-testid="game-title">Walk the Plank</h1>
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
          <div className="max-w-sm mx-auto space-y-2">
            {levels.map(level => {
              const isCurrentLevel = level === currentLevel && gameActive;
              const isPastLevel = level < currentLevel;
              const isFailLevel = level === failedLevel;
              const levelMult = Math.pow(1.5, level + 1).toFixed(2);

              return (
                <div key={level} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12 text-right">{levelMult}x</span>
                  <div className="flex gap-2 flex-1">
                    {[0, 1, 2].map(tile => {
                      const wasChosen = isPastLevel && choices[level] === tile;
                      const isFailed = isFailLevel && failedTile === tile;
                      const wasSafe = isFailLevel && allSafeTiles[level] === tile;
                      return (
                        <motion.button
                          key={tile}
                          whileTap={isCurrentLevel ? { scale: 0.9 } : {}}
                          onClick={() => isCurrentLevel && revealMutation.mutate(tile)}
                          disabled={!isCurrentLevel || revealMutation.isPending}
                          data-testid={`tower-tile-${level}-${tile}`}
                          className={`flex-1 h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all
                            ${isFailed ? "bg-red-500/80 text-white" :
                              wasSafe && isFailLevel ? "bg-green-500/50 text-white" :
                              wasChosen ? "bg-green-500/80 text-white" :
                              isCurrentLevel ? "bg-primary/20 border border-primary/30 cursor-pointer hover:bg-primary/30 text-primary" :
                              isPastLevel ? "bg-muted/20" :
                              "bg-muted/30"}`}
                        >
                          {isFailed ? <Skull className="w-5 h-5" /> :
                           wasChosen ? <CheckCircle2 className="w-5 h-5" /> :
                           isCurrentLevel ? "?" : ""}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {gameActive && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
              <p className="text-lg gold-text font-display" data-testid="tower-multiplier">{multiplier.toFixed(2)}x</p>
              <p className="text-xs text-muted-foreground">Level {currentLevel}/8</p>
            </motion.div>
          )}
        </div>

        <div className="glass-panel rounded-xl border border-border/50 p-4 space-y-4 h-fit" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          <div>
            <label className="text-xs text-muted-foreground">Balance ({currency})</label>
            <p className="text-lg font-bold gold-text" data-testid="tower-balance">${balance.toFixed(2)}</p>
          </div>
          {!gameActive && !gameOver && (
            <>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Bet Amount</label>
                <div className="flex gap-1">
                  <Input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
                    className="bg-muted/50 border-border" data-testid="tower-bet-input" min="1" />
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
                onClick={() => startMutation.mutate()} data-testid="tower-start-btn">
                {startMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {!isAuthenticated ? "Login to Play" : "Start Climbing"}
              </Button>
            </>
          )}
          {gameActive && currentLevel > 0 && (
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider"
              onClick={() => cashoutMutation.mutate()} disabled={cashoutMutation.isPending}
              data-testid="tower-cashout-btn">
              Cash Out ${(parseFloat(betAmount) * multiplier).toFixed(2)}
            </Button>
          )}
          {gameOver && (
            <Button className="w-full btn-casino uppercase tracking-wider" onClick={reset} data-testid="tower-new-game-btn">
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
