import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Bot, Infinity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AutobetState {
  enabled: boolean;
  betsRemaining: number;
  infiniteBets: boolean;
  stopOnWin: boolean;
  stopOnWinAmount: number;
  stopOnLoss: boolean;
  stopOnLossAmount: number;
}

export interface AutobetControls {
  autobetState: AutobetState;
  autobetRef: React.MutableRefObject<AutobetState>;
  setAutobetEnabled: (v: boolean) => void;
  patchState: (patch: Partial<AutobetState>) => void;
  handleBetResult: (opts: { won: boolean; payout: number; betAmount: number }) => void;
  decrementBets: () => void;
  shouldContinue: () => boolean;
}

export function useAutobet(): AutobetControls {
  const [autobetState, setAutobetState] = useState<AutobetState>({
    enabled: false,
    betsRemaining: 10,
    infiniteBets: false,
    stopOnWin: false,
    stopOnWinAmount: 0,
    stopOnLoss: false,
    stopOnLossAmount: 0,
  });

  // Ref so async callbacks always see latest state
  const autobetRef = useRef<AutobetState>(autobetState);
  useEffect(() => {
    autobetRef.current = autobetState;
  }, [autobetState]);

  const setAutobetEnabled = useCallback((v: boolean) => {
    setAutobetState(prev => ({ ...prev, enabled: v }));
  }, []);

  const decrementBets = useCallback(() => {
    setAutobetState(prev => ({
      ...prev,
      betsRemaining: prev.infiniteBets ? prev.betsRemaining : Math.max(0, prev.betsRemaining - 1),
    }));
  }, []);

  const shouldContinue = useCallback((): boolean => {
    const s = autobetRef.current;
    if (!s.enabled) return false;
    if (!s.infiniteBets && s.betsRemaining <= 0) return false;
    return true;
  }, []);

  const handleBetResult = useCallback(({ won, payout, betAmount }: { won: boolean; payout: number; betAmount: number }) => {
    const s = autobetRef.current;
    if (!s.enabled) return;
    if (won && s.stopOnWin && payout >= s.stopOnWinAmount && s.stopOnWinAmount > 0) {
      setAutobetState(prev => ({ ...prev, enabled: false }));
    }
    if (!won && s.stopOnLoss && betAmount >= s.stopOnLossAmount && s.stopOnLossAmount > 0) {
      setAutobetState(prev => ({ ...prev, enabled: false }));
    }
  }, []);

  const patchState = useCallback((patch: Partial<AutobetState>) => {
    setAutobetState(prev => ({ ...prev, ...patch }));
  }, []);

  return {
    autobetState,
    autobetRef,
    setAutobetEnabled,
    patchState,
    handleBetResult,
    decrementBets,
    shouldContinue,
  };
}

interface AutobetPanelProps {
  autobetState: AutobetState;
  onChange: (patch: Partial<AutobetState>) => void;
}

export function AutobetPanel({ autobetState, onChange }: AutobetPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden" data-testid="autobet-panel">
      {/* Toggle Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary/60" />
          <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Auto Bet</span>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={autobetState.enabled}
            onCheckedChange={(v) => onChange({ enabled: v })}
            data-testid="autobet-toggle"
          />
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setExpanded(v => !v)}
            data-testid="autobet-expand-btn"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Settings */}
      <AnimatePresence>
        {(expanded || autobetState.enabled) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4 bg-muted/10 border-t border-border/30">
              {/* Number of Bets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-muted-foreground">Number of Bets</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Infinite</span>
                    <Checkbox
                      checked={autobetState.infiniteBets}
                      onCheckedChange={(v) => onChange({ infiniteBets: !!v })}
                      data-testid="autobet-infinite-checkbox"
                    />
                  </div>
                </div>
                {autobetState.infiniteBets ? (
                  <div className="bg-muted/30 border border-border rounded-md px-3 py-2 flex items-center justify-center gap-2">
                    <Infinity className="w-4 h-4 text-primary/60" />
                    <span className="text-xs text-muted-foreground">Infinite bets</span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={autobetState.betsRemaining}
                    onChange={(e) => onChange({ betsRemaining: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="bg-muted/50 border-border text-sm"
                    min="1"
                    data-testid="autobet-bets-input"
                  />
                )}
                {autobetState.enabled && !autobetState.infiniteBets && (
                  <p className="text-[10px] text-primary/60 mt-1">
                    {autobetState.betsRemaining} bet{autobetState.betsRemaining !== 1 ? "s" : ""} remaining
                  </p>
                )}
              </div>

              {/* Stop on Win */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={autobetState.stopOnWin}
                    onCheckedChange={(v) => onChange({ stopOnWin: !!v })}
                    data-testid="autobet-stop-win-checkbox"
                  />
                  <label className="text-xs text-foreground/80">Stop on Win ≥</label>
                </div>
                {autobetState.stopOnWin && (
                  <Input
                    type="number"
                    value={autobetState.stopOnWinAmount || ""}
                    onChange={(e) => onChange({ stopOnWinAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="Win amount threshold"
                    className="bg-muted/50 border-border text-sm"
                    min="0"
                    data-testid="autobet-stop-win-input"
                  />
                )}
              </div>

              {/* Stop on Loss */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={autobetState.stopOnLoss}
                    onCheckedChange={(v) => onChange({ stopOnLoss: !!v })}
                    data-testid="autobet-stop-loss-checkbox"
                  />
                  <label className="text-xs text-foreground/80">Stop on Loss ≥</label>
                </div>
                {autobetState.stopOnLoss && (
                  <Input
                    type="number"
                    value={autobetState.stopOnLossAmount || ""}
                    onChange={(e) => onChange({ stopOnLossAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="Loss amount threshold"
                    className="bg-muted/50 border-border text-sm"
                    min="0"
                    data-testid="autobet-stop-loss-input"
                  />
                )}
              </div>

              {autobetState.enabled && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-primary/80 text-center uppercase tracking-wider font-semibold">
                    Auto Bet Active — {autobetState.infiniteBets ? "∞" : autobetState.betsRemaining} remaining
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
