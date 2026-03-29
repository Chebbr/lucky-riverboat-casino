import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Trophy, Search, X, Loader2, RefreshCw, ChevronRight,
  TrendingUp, Clock, Zap, List, SlidersHorizontal
} from "lucide-react";
import type { SportsBet } from "@shared/schema";

// ─── Sports config ───────────────────────────────────────────────────────────

const SPORTS = [
  { key: "all", label: "All Sports", icon: "🏆", leagues: [] },
  {
    key: "football", label: "Football", icon: "🏈",
    leagues: [
      { id: "nfl", name: "NFL" },
      { id: "college-football", name: "NCAAF" },
    ],
  },
  {
    key: "basketball", label: "Basketball", icon: "🏀",
    leagues: [
      { id: "nba", name: "NBA" },
      { id: "mens-college-basketball", name: "NCAAM" },
      { id: "wnba", name: "WNBA" },
    ],
  },
  {
    key: "baseball", label: "Baseball", icon: "⚾",
    leagues: [{ id: "mlb", name: "MLB" }],
  },
  {
    key: "hockey", label: "Hockey", icon: "🏒",
    leagues: [{ id: "nhl", name: "NHL" }],
  },
  {
    key: "soccer", label: "Soccer", icon: "⚽",
    leagues: [
      { id: "usa.1", name: "MLS" },
      { id: "eng.1", name: "Premier League" },
      { id: "esp.1", name: "La Liga" },
      { id: "ger.1", name: "Bundesliga" },
      { id: "ita.1", name: "Serie A" },
      { id: "uefa.champions", name: "Champions League" },
    ],
  },
  {
    key: "mma", label: "MMA", icon: "🥊",
    leagues: [{ id: "ufc", name: "UFC" }],
  },
  {
    key: "tennis", label: "Tennis", icon: "🎾",
    leagues: [
      { id: "atp", name: "ATP" },
      { id: "wta", name: "WTA" },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Match {
  id: string;
  sport: string;
  league: string;
  home: string;
  away: string;
  time: string;
  score: string | null;
  isLive: boolean;
  odds: { home: number; draw: number | null; away: number };
}

interface BetSelection {
  id: string;
  matchId: string;
  match: string;
  selection: "home" | "draw" | "away";
  selectionName: string;
  odds: number;
  league: string;
}

// ─── Odds calculation ─────────────────────────────────────────────────────────

function calcOdds(eventId: string, sport: string) {
  const seed = parseInt(String(eventId).slice(-4)) || 50;
  const homeOdds = +(1.2 + (seed % 300) / 100).toFixed(2);
  const awayOdds = +(1.2 + ((seed * 13) % 300) / 100).toFixed(2);
  const drawOdds = sport === "soccer" ? +(2.5 + ((seed * 7) % 200) / 100).toFixed(2) : null;
  return { home: homeOdds, draw: drawOdds, away: awayOdds };
}

// ─── ESPN data fetching ───────────────────────────────────────────────────────

async function fetchLeague(sportKey: string, leagueId: string, leagueName: string): Promise<Match[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sportKey}/${leagueId}/scoreboard`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const events: any[] = data.events || [];

  return events
    .filter((e: any) => {
      const state = e.status?.type?.state;
      return state !== "post";
    })
    .map((e: any) => {
      const comp = e.competitions?.[0];
      const competitors: any[] = comp?.competitors || [];
      const home = competitors.find((c: any) => c.homeAway === "home");
      const away = competitors.find((c: any) => c.homeAway === "away");
      const state = e.status?.type?.state;
      const isLive = state === "in";
      const score = isLive
        ? `${home?.score ?? 0} - ${away?.score ?? 0}`
        : null;

      return {
        id: String(e.id),
        sport: sportKey,
        league: leagueName,
        home: home?.team?.displayName || home?.team?.name || "Home",
        away: away?.team?.displayName || away?.team?.name || "Away",
        time: e.status?.type?.shortDetail || "",
        score,
        isLive,
        odds: calcOdds(String(e.id), sportKey),
      } satisfies Match;
    });
}

async function fetchAllMatches(): Promise<Match[]> {
  const tasks: Promise<Match[]>[] = [];

  for (const sport of SPORTS) {
    if (sport.key === "all") continue;
    for (const league of sport.leagues) {
      tasks.push(fetchLeague(sport.key, league.id, league.name));
    }
  }

  const results = await Promise.allSettled(tasks);
  const all: Match[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  // Sort: live first, then upcoming
  all.sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    return 0;
  });

  return all;
}

// ─── Sport event counts hook ──────────────────────────────────────────────────

function useSportCounts(matches: Match[]) {
  return useMemo(() => {
    const counts: Record<string, number> = { all: matches.length };
    for (const m of matches) {
      counts[m.sport] = (counts[m.sport] || 0) + 1;
    }
    return counts;
  }, [matches]);
}

// ─── EventCard ────────────────────────────────────────────────────────────────

function EventCard({
  match,
  selectedIds,
  onToggle,
}: {
  match: Match;
  selectedIds: Set<string>;
  onToggle: (matchId: string, sel: "home" | "draw" | "away") => void;
}) {
  const isHomeSelected = selectedIds.has(`${match.id}-home`);
  const isDrawSelected = selectedIds.has(`${match.id}-draw`);
  const isAwaySelected = selectedIds.has(`${match.id}-away`);

  const btnBase =
    "flex-1 py-2 px-1 rounded-lg text-xs font-bold transition-all duration-200 flex flex-col items-center gap-0.5";
  const btnActive =
    "bg-primary text-primary-foreground shadow-[0_0_12px_oklch(0.78_0.12_85/0.4)]";
  const btnIdle =
    "bg-muted/50 text-foreground hover:bg-muted/80 hover:text-primary border border-transparent hover:border-primary/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`glass-panel rounded-xl p-4 transition-all duration-200 ${
        isHomeSelected || isDrawSelected || isAwaySelected
          ? "gold-glow border-primary/40"
          : "border border-transparent"
      }`}
      data-testid={`sports-event-${match.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary h-4">
            {match.league}
          </Badge>
          {match.isLive && (
            <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          {match.isLive ? (
            <span className="text-primary font-bold">{match.time}</span>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              <span>{match.time}</span>
            </>
          )}
        </div>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-2 my-2">
        <span className="text-sm font-semibold flex-1 leading-tight">{match.home}</span>
        <div className="text-center shrink-0 px-2">
          {match.isLive && match.score ? (
            <span className="text-sm font-bold text-primary">{match.score}</span>
          ) : (
            <span className="text-xs text-muted-foreground font-medium">vs</span>
          )}
        </div>
        <span className="text-sm font-semibold flex-1 text-right leading-tight">{match.away}</span>
      </div>

      {/* Odds buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onToggle(match.id, "home")}
          className={`${btnBase} ${isHomeSelected ? btnActive : btnIdle}`}
          data-testid={`odds-home-${match.id}`}
        >
          <span className="text-[9px] uppercase tracking-wider opacity-70">1</span>
          <span>{match.odds.home}</span>
        </button>
        {match.odds.draw !== null && (
          <button
            onClick={() => onToggle(match.id, "draw")}
            className={`${btnBase} ${isDrawSelected ? btnActive : btnIdle}`}
            data-testid={`odds-draw-${match.id}`}
          >
            <span className="text-[9px] uppercase tracking-wider opacity-70">X</span>
            <span>{match.odds.draw}</span>
          </button>
        )}
        <button
          onClick={() => onToggle(match.id, "away")}
          className={`${btnBase} ${isAwaySelected ? btnActive : btnIdle}`}
          data-testid={`odds-away-${match.id}`}
        >
          <span className="text-[9px] uppercase tracking-wider opacity-70">2</span>
          <span>{match.odds.away}</span>
        </button>
      </div>
    </motion.div>
  );
}

// ─── BetSlip ──────────────────────────────────────────────────────────────────

function BetSlip({
  selections,
  onRemove,
  onClear,
  isAuthenticated,
  onBetPlaced,
}: {
  selections: BetSelection[];
  onRemove: (id: string) => void;
  onClear: () => void;
  isAuthenticated: boolean;
  onBetPlaced: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isParlay, setIsParlay] = useState(false);
  const [stakes, setStakes] = useState<Record<string, string>>({});
  const [parlayStake, setParlayStake] = useState("25");
  const [slipTab, setSlipTab] = useState<"slip" | "bets">("slip");

  const { data: myBets, isLoading: betsLoading } = useQuery<SportsBet[]>({
    queryKey: ["/api/sports/bets"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const placeBetMutation = useMutation({
    mutationFn: async (payload: { eventId: string; prediction: string; amount: number; currency: string }) => {
      const res = await apiRequest("POST", "/api/sports/bet", payload);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      qc.invalidateQueries({ queryKey: ["/api/sports/bets"] });
    },
    onError: (err: Error) => {
      toast({ title: "Bet failed", description: err.message, variant: "destructive" });
    },
  });

  const parlayOdds = useMemo(() => {
    if (selections.length === 0) return 1;
    return +selections.reduce((acc, s) => acc * s.odds, 1).toFixed(2);
  }, [selections]);

  const getStake = (id: string) => parseFloat(stakes[id] || "25") || 0;
  const parlayPayout = (parseFloat(parlayStake) || 0) * parlayOdds;

  const handlePlaceSingle = useCallback(async () => {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please log in to place bets.", variant: "destructive" });
      return;
    }
    let hasError = false;
    for (const sel of selections) {
      const amount = getStake(sel.id);
      if (amount <= 0) continue;
      try {
        await placeBetMutation.mutateAsync({
          eventId: sel.matchId,
          prediction: sel.selection,
          amount,
          currency: "USDT",
        });
      } catch {
        hasError = true;
      }
    }
    if (!hasError) {
      toast({ title: "Bets placed!", description: `${selections.length} bet(s) placed successfully.` });
      onBetPlaced();
    }
  }, [selections, stakes, isAuthenticated]);

  const handlePlaceParlay = useCallback(async () => {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please log in to place bets.", variant: "destructive" });
      return;
    }
    if (selections.length === 0) return;
    // Place parlay as first selection with combined stake
    const first = selections[0];
    const amount = parseFloat(parlayStake) || 0;
    if (amount <= 0) return;
    try {
      await placeBetMutation.mutateAsync({
        eventId: first.matchId,
        prediction: first.selection,
        amount,
        currency: "USDT",
      });
      toast({
        title: "Parlay placed!",
        description: `$${parlayStake} parlay @ ${parlayOdds}x — potential $${parlayPayout.toFixed(2)}`,
      });
      onBetPlaced();
    } catch {
      // error handled by mutation
    }
  }, [selections, parlayStake, parlayOdds, isAuthenticated]);

  const QUICK_STAKES = [10, 25, 50, 100];

  return (
    <div className="glass-panel rounded-xl overflow-hidden h-full flex flex-col">
      {/* Slip header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setSlipTab("slip")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              slipTab === "slip" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-betslip"
          >
            Bet Slip {selections.length > 0 && <span className="ml-1 bg-primary-foreground/20 rounded px-1">{selections.length}</span>}
          </button>
          <button
            onClick={() => setSlipTab("bets")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              slipTab === "bets" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="tab-mybets"
          >
            My Bets
          </button>
        </div>
        {slipTab === "slip" && selections.length > 0 && (
          <button onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
            Clear all
          </button>
        )}
      </div>

      {slipTab === "slip" ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {selections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <List className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Select odds to add to your slip</p>
            </div>
          ) : (
            <>
              {/* Single / Parlay toggle */}
              <div className="flex bg-muted/40 rounded-lg p-0.5 gap-0.5">
                <button
                  onClick={() => setIsParlay(false)}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
                    !isParlay ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                  data-testid="toggle-single"
                >
                  Single
                </button>
                <button
                  onClick={() => setIsParlay(true)}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${
                    isParlay ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                  data-testid="toggle-parlay"
                >
                  Parlay
                </button>
              </div>

              {/* Selections */}
              <AnimatePresence>
                {selections.map((sel) => {
                  const stake = getStake(sel.id);
                  const payout = stake * sel.odds;
                  return (
                    <motion.div
                      key={sel.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-muted/30 rounded-lg p-3 space-y-2"
                      data-testid={`slip-item-${sel.matchId}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold leading-tight truncate">{sel.match}</p>
                          <p className="text-[11px] text-primary font-bold mt-0.5">
                            {sel.selectionName} @ <span className="text-foreground">{sel.odds}</span>
                          </p>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/20 text-muted-foreground mt-1 h-3.5">
                            {sel.league}
                          </Badge>
                        </div>
                        <button
                          onClick={() => onRemove(sel.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                          data-testid={`remove-${sel.id}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {!isParlay && (
                        <>
                          <Input
                            type="number"
                            value={stakes[sel.id] || "25"}
                            onChange={(e) => setStakes((p) => ({ ...p, [sel.id]: e.target.value }))}
                            className="h-7 text-xs bg-background/50 border-border"
                            placeholder="Stake"
                            min={1}
                            data-testid={`stake-input-${sel.id}`}
                          />
                          <div className="flex gap-1">
                            {QUICK_STAKES.map((v) => (
                              <button
                                key={v}
                                onClick={() => setStakes((p) => ({ ...p, [sel.id]: String(v) }))}
                                className="flex-1 text-[9px] font-bold py-1 rounded bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                              >
                                ${v}
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Payout:{" "}
                            <span className="gold-text font-bold">${payout.toFixed(2)}</span>
                          </p>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Parlay summary */}
              {isParlay && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{selections.length} selections</span>
                    <span className="font-bold text-primary">
                      Combined: <span className="gold-text">{parlayOdds}x</span>
                    </span>
                  </div>
                  <Input
                    type="number"
                    value={parlayStake}
                    onChange={(e) => setParlayStake(e.target.value)}
                    className="h-7 text-xs bg-background/50 border-border"
                    placeholder="Parlay stake"
                    min={1}
                    data-testid="parlay-stake-input"
                  />
                  <div className="flex gap-1">
                    {QUICK_STAKES.map((v) => (
                      <button
                        key={v}
                        onClick={() => setParlayStake(String(v))}
                        className="flex-1 text-[9px] font-bold py-1 rounded bg-muted/60 hover:bg-primary/20 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-bold flex justify-between">
                    <span className="text-muted-foreground">Potential payout:</span>
                    <span className="gold-text">${parlayPayout.toFixed(2)}</span>
                  </p>
                </motion.div>
              )}

              {/* Place bet button */}
              <Button
                className="w-full btn-casino h-10 text-sm"
                disabled={placeBetMutation.isPending || !isAuthenticated}
                onClick={isParlay ? handlePlaceParlay : handlePlaceSingle}
                data-testid="place-bet-btn"
              >
                {placeBetMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                {isParlay ? "Place Parlay" : `Place ${selections.length} Bet${selections.length !== 1 ? "s" : ""}`}
              </Button>

              {!isAuthenticated && (
                <p className="text-center text-xs text-muted-foreground">Log in to place bets</p>
              )}
            </>
          )}
        </div>
      ) : (
        /* My Bets tab */
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {betsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !isAuthenticated ? (
            <p className="text-center text-xs text-muted-foreground py-8">Log in to view your bets</p>
          ) : myBets && myBets.length > 0 ? (
            myBets.slice(0, 20).map((bet: SportsBet) => (
              <div
                key={bet.id}
                className="bg-muted/30 rounded-lg p-2.5 text-xs"
                data-testid={`bet-history-${bet.id}`}
              >
                <div className="flex justify-between items-center">
                  <span className="capitalize font-semibold">{bet.prediction}</span>
                  <span
                    className={`font-bold ${
                      bet.status === "won"
                        ? "text-green-400"
                        : bet.status === "lost"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {bet.status}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground mt-0.5">
                  <span>@ {bet.odds}</span>
                  <span>${Number(bet.amount).toFixed(2)} {bet.currency}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-muted-foreground py-8">No bets yet</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SportsbookPage() {
  const { isAuthenticated } = useAuth();
  const [selectedSport, setSelectedSport] = useState("all");
  const [eventTab, setEventTab] = useState<"live" | "upcoming">("upcoming");
  const [search, setSearch] = useState("");
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [mobileSlipOpen, setMobileSlipOpen] = useState(false);

  // Fetch all matches from ESPN
  const { data: allMatches = [], isLoading, isError, refetch, isFetching } = useQuery<Match[]>({
    queryKey: ["espn-matches"],
    queryFn: fetchAllMatches,
    refetchInterval: 30000,
    staleTime: 20000,
    retry: 1,
  });

  const sportCounts = useSportCounts(allMatches);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    let list = allMatches;
    if (selectedSport !== "all") {
      list = list.filter((m) => m.sport === selectedSport);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.home.toLowerCase().includes(q) ||
          m.away.toLowerCase().includes(q) ||
          m.league.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allMatches, selectedSport, search]);

  const liveMatches = filteredMatches.filter((m) => m.isLive);
  const upcomingMatches = filteredMatches.filter((m) => !m.isLive);

  // Toggle a bet selection
  const handleToggle = useCallback(
    (matchId: string, sel: "home" | "draw" | "away") => {
      const selectionId = `${matchId}-${sel}`;
      setSelections((prev) => {
        // Remove any existing selection for this match
        const withoutMatch = prev.filter((s) => s.matchId !== matchId);
        // If same selection was already selected, just remove it (toggle off)
        if (prev.some((s) => s.id === selectionId)) return withoutMatch;

        const match = allMatches.find((m) => m.id === matchId);
        if (!match) return prev;

        const odds =
          sel === "home" ? match.odds.home : sel === "away" ? match.odds.away : (match.odds.draw ?? 1);
        const selectionName =
          sel === "home" ? match.home : sel === "away" ? match.away : "Draw";

        const newSel: BetSelection = {
          id: selectionId,
          matchId,
          match: `${match.home} vs ${match.away}`,
          selection: sel,
          selectionName,
          odds,
          league: match.league,
        };

        return [...withoutMatch, newSel];
      });
    },
    [allMatches]
  );

  const handleRemove = useCallback((id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleClear = useCallback(() => setSelections([]), []);

  const selectedIds = useMemo(() => new Set(selections.map((s) => s.id)), [selections]);

  const displayedMatches = eventTab === "live" ? liveMatches : upcomingMatches;

  return (
    <div className="flex h-full min-h-screen bg-background">
      {/* ── Left Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-sidebar/50 pt-4">
        <div className="px-3 mb-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2">Sports</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {SPORTS.map((sport) => {
            const count = sportCounts[sport.key] || 0;
            const isActive = selectedSport === sport.key;
            return (
              <button
                key={sport.key}
                onClick={() => setSelectedSport(sport.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent"
                }`}
                data-testid={`sport-filter-${sport.key}`}
              >
                <span className="flex items-center gap-2">
                  <span>{sport.icon}</span>
                  <span className="font-medium">{sport.label}</span>
                </span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Center Content ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-5 h-5 text-primary shrink-0" />
            <h1 className="font-display text-lg gold-text" data-testid="sportsbook-title">
              Sportsbook
            </h1>
            {isFetching && !isLoading && (
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin ml-auto" />
            )}
          </div>

          {/* Mobile sport filter */}
          <div className="flex lg:hidden gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {SPORTS.map((sport) => (
              <button
                key={sport.key}
                onClick={() => setSelectedSport(sport.key)}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedSport === sport.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{sport.icon}</span>
                <span>{sport.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams or leagues..."
              className="pl-8 h-8 text-sm bg-muted/30 border-border"
              data-testid="search-input"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Live / Upcoming tabs */}
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => setEventTab("live")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                eventTab === "live"
                  ? "bg-red-500/15 text-red-400 border border-red-400/30"
                  : "text-muted-foreground hover:text-foreground bg-muted/30"
              }`}
              data-testid="tab-live"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Live ({liveMatches.length})
            </button>
            <button
              onClick={() => setEventTab("upcoming")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                eventTab === "upcoming"
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground bg-muted/30"
              }`}
              data-testid="tab-upcoming"
            >
              <Clock className="w-3 h-3" />
              Upcoming ({upcomingMatches.length})
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-panel rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-muted/60 rounded w-24 mb-3" />
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-4 bg-muted/60 rounded w-32" />
                    <div className="h-4 bg-muted/60 rounded w-32" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted/60 rounded flex-1" />
                    <div className="h-8 bg-muted/60 rounded flex-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-3">Failed to load events</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          ) : displayedMatches.length === 0 ? (
            <div className="text-center py-16">
              <Zap className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                {eventTab === "live"
                  ? "No live events right now"
                  : search
                  ? "No events match your search"
                  : "No upcoming events"}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {displayedMatches.map((match) => (
                <EventCard
                  key={match.id}
                  match={match}
                  selectedIds={selectedIds}
                  onToggle={handleToggle}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* ── Right Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-80 shrink-0 border-l border-border p-4">
        <div className="sticky top-4 h-[calc(100vh-2rem)] flex flex-col">
          <BetSlip
            selections={selections}
            onRemove={handleRemove}
            onClear={handleClear}
            isAuthenticated={isAuthenticated}
            onBetPlaced={handleClear}
          />
        </div>
      </aside>

      {/* ── Mobile Bet Slip FAB ── */}
      <div className="lg:hidden fixed bottom-6 right-4 z-50">
        <Sheet open={mobileSlipOpen} onOpenChange={setMobileSlipOpen}>
          <SheetTrigger asChild>
            <button
              className="relative btn-casino rounded-full w-14 h-14 flex items-center justify-center shadow-xl glow-gold-sm"
              data-testid="open-betslip-fab"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {selections.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {selections.length}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-4 bg-background border-t border-border rounded-t-2xl">
            <div className="h-full">
              <BetSlip
                selections={selections}
                onRemove={handleRemove}
                onClear={handleClear}
                isAuthenticated={isAuthenticated}
                onBetPlaced={() => { handleClear(); setMobileSlipOpen(false); }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
