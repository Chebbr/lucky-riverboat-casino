import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Wallet } from "@shared/schema";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { AutobetPanel, useAutobet } from "@/components/autobet-panel";

const SEGMENTS = [
  { label: "1x", color: "#374151", value: 1 },
  { label: "2x", color: "#1e40af", value: 2 },
  { label: "3x", color: "#7c3aed", value: 3 },
  { label: "1x", color: "#374151", value: 1 },
  { label: "5x", color: "#059669", value: 5 },
  { label: "2x", color: "#1e40af", value: 2 },
  { label: "1x", color: "#374151", value: 1 },
  { label: "10x", color: "#ca8a04", value: 10 },
  { label: "3x", color: "#7c3aed", value: 3 },
  { label: "1x", color: "#374151", value: 1 },
  { label: "20x", color: "#dc2626", value: 20 },
  { label: "2x", color: "#1e40af", value: 2 },
  { label: "1x", color: "#374151", value: 1 },
  { label: "50x", color: "#eab308", value: 50 },
  { label: "5x", color: "#059669", value: 5 },
  { label: "1x", color: "#374151", value: 1 },
];

const PLAYER_COUNT = Math.floor(Math.random() * 200 + 50);

export default function HelmGame() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("10");
  const [currency] = useState("USDT");
  const [result, setResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });
  const balance = wallets?.find(w => w.currency === currency)?.balance || 0;

  const autobet = useAutobet();
  const autobetTimeoutRef = useRef<any>(null);

  const playMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games/play", {
        gameSlug: "helm", betAmount: parseFloat(betAmount), currency, gameData: {},
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSpinning(true);
      // Find segment index matching result
      const segIdx = SEGMENTS.findIndex(s => s.label === data.segment);
      const segAngle = 360 / SEGMENTS.length;
      const targetAngle = 360 * 5 + (360 - segIdx * segAngle - segAngle / 2);
      setRotation(targetAngle);

      setTimeout(() => {
        setResult(data);
        setSpinning(false);
        queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
        if (data.payout > 0) {
          toast({ title: `${data.segment} — Won $${data.payout.toFixed(2)}!`, description: `${data.multiplier}x multiplier` });
        }
        autobet.handleBetResult({ won: data.payout > 0, payout: data.payout, betAmount: parseFloat(betAmount) });
        autobet.decrementBets();
        if (autobet.shouldContinue()) {
          autobetTimeoutRef.current = setTimeout(() => {
            if (autobet.shouldContinue()) playMutation.mutate();
          }, 1500);
        } else {
          autobet.setAutobetEnabled(false);
        }
      }, 4000);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      autobet.setAutobetEnabled(false);
    },
  });

  const segAngle = 360 / SEGMENTS.length;

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
          <h1 className="font-display text-xl gold-text" data-testid="game-title">Helm</h1>
          <span className="text-[10px] uppercase tracking-widest font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">100% RTP</span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded">Provably Fair</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{PLAYER_COUNT} playing</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="rounded-xl border border-border/50 overflow-hidden glass-panel p-8 flex flex-col items-center" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          {/* Pointer */}
          <div className="relative mb-[-20px] z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary" />
          </div>

          {/* Wheel */}
          <div className="relative w-72 h-72">
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full h-full rounded-full border-4 border-primary/50 overflow-hidden relative"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {SEGMENTS.map((seg, i) => {
                  const startAngle = i * segAngle;
                  const endAngle = (i + 1) * segAngle;
                  const startRad = (startAngle - 90) * (Math.PI / 180);
                  const endRad = (endAngle - 90) * (Math.PI / 180);
                  const x1 = 100 + 100 * Math.cos(startRad);
                  const y1 = 100 + 100 * Math.sin(startRad);
                  const x2 = 100 + 100 * Math.cos(endRad);
                  const y2 = 100 + 100 * Math.sin(endRad);
                  const midRad = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
                  const textX = 100 + 65 * Math.cos(midRad);
                  const textY = 100 + 65 * Math.sin(midRad);

                  return (
                    <g key={i}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                        fill={seg.color}
                        stroke="#1a1b1e"
                        strokeWidth="0.5"
                      />
                      <text
                        x={textX} y={textY}
                        textAnchor="middle" dominantBaseline="middle"
                        fill="white" fontSize="10" fontWeight="bold"
                        transform={`rotate(${(startAngle + endAngle) / 2}, ${textX}, ${textY})`}
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
                <circle cx="100" cy="100" r="15" fill="#1a1b1e" stroke="#EAB308" strokeWidth="2" />
                <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fill="#EAB308" fontSize="8" fontWeight="bold">
                  HELM
                </text>
              </svg>
            </motion.div>
          </div>

          {result && !spinning && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
              <p className="text-2xl font-display gold-text neon-text-gold" data-testid="helm-result">
                {result.segment} — ${result.payout.toFixed(2)}
              </p>
            </motion.div>
          )}
        </div>

        <div className="glass-panel rounded-xl border border-border/50 p-4 space-y-4 h-fit" style={{ boxShadow: "inset 0 2px 12px rgba(0,0,0,0.3)" }}>
          <div>
            <label className="text-xs text-muted-foreground">Balance ({currency})</label>
            <p className="text-lg font-bold gold-text" data-testid="helm-balance">${balance.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Bet Amount</label>
            <div className="flex gap-1">
              <Input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
                className="bg-muted/50 border-border" data-testid="helm-bet-input" min="1" />
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
          <Button className="w-full btn-casino uppercase tracking-wider" disabled={!isAuthenticated || spinning || playMutation.isPending}
            onClick={() => playMutation.mutate()} data-testid="helm-spin-btn">
            {spinning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {!isAuthenticated ? "Login to Play" : spinning ? "Spinning..." : "Spin the Helm"}
          </Button>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Segments</p>
            <div className="grid grid-cols-2 gap-1">
              {["1x", "2x", "3x", "5x", "10x", "20x", "50x"].map(s => (
                <span key={s} className="text-xs text-foreground">{s}</span>
              ))}
            </div>
          </div>
          <AutobetPanel autobetState={autobet.autobetState} onChange={autobet.patchState} />
          <div className="pt-2 border-t border-border/50 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-primary/50" />
            <span className="text-[10px] text-primary/50 uppercase tracking-widest">Provably Fair</span>
          </div>
        </div>
      </div>
    </div>
  );
}
