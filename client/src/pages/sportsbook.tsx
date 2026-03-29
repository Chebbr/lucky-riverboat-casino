import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { SportsEvent, SportsBet, Wallet } from "@shared/schema";
import { Trophy, Clock, Zap, Loader2 } from "lucide-react";
import sportsPath from "@assets/MarkMcGwire.png";

export default function SportsbookPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
  const [prediction, setPrediction] = useState<string>("");
  const [betAmount, setBetAmount] = useState("25");
  const [currency] = useState("USDT");

  const { data: events } = useQuery<SportsEvent[]>({
    queryKey: ["/api/sports/events"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: myBets } = useQuery<SportsBet[]>({
    queryKey: ["/api/sports/bets"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const balance = wallets?.find(w => w.currency === currency)?.balance || 0;

  const placeBetMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sports/bet", {
        eventId: selectedEvent?.id,
        prediction,
        amount: parseFloat(betAmount),
        currency,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sports/bets"] });
      toast({ title: "Bet Placed!", description: `$${betAmount} on ${prediction}` });
      setSelectedEvent(null);
      setPrediction("");
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const upcomingEvents = events?.filter(e => e.status === "upcoming") || [];
  const liveEvents = events?.filter(e => e.status === "live") || [];

  const getOdds = (event: SportsEvent, pred: string) => {
    if (pred === "home") return event.homeOdds;
    if (pred === "away") return event.awayOdds;
    return event.drawOdds || 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h1 className="font-display text-2xl gold-text" data-testid="sportsbook-title">Sportsbook</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        {/* Events */}
        <div>
          <Tabs defaultValue="upcoming">
            <TabsList className="bg-muted/50 mb-4">
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                <Clock className="w-3 h-3 mr-1" /> Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="live" data-testid="tab-live">
                <Zap className="w-3 h-3 mr-1" /> Live ({liveEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-3">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} selectedEvent={selectedEvent}
                  onSelect={setSelectedEvent} prediction={prediction} setPrediction={setPrediction} />
              ))}
            </TabsContent>

            <TabsContent value="live" className="space-y-3">
              {liveEvents.map(event => (
                <EventCard key={event.id} event={event} selectedEvent={selectedEvent}
                  onSelect={setSelectedEvent} prediction={prediction} setPrediction={setPrediction} isLive />
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Bet Slip */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-display text-sm gold-text mb-3">Bet Slip</h3>
            {selectedEvent && prediction ? (
              <div className="space-y-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm font-medium">{selectedEvent.homeTeam} vs {selectedEvent.awayTeam}</p>
                  <p className="text-xs text-muted-foreground">{selectedEvent.sport} — {selectedEvent.league}</p>
                  <p className="text-sm mt-1">
                    Prediction: <span className="text-primary font-bold capitalize">{prediction}</span>
                    <span className="text-muted-foreground ml-2">@ {getOdds(selectedEvent, prediction)}</span>
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Bet Amount</label>
                  <Input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
                    className="bg-muted/50 border-border" data-testid="sports-bet-input" min="1" />
                </div>
                <div className="flex gap-2">
                  {[25, 50, 100, 250].map(v => (
                    <Button key={v} variant="outline" size="sm" onClick={() => setBetAmount(v.toString())}
                      className="border-primary/30 text-primary text-xs flex-1">${v}</Button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Potential win: <span className="gold-text font-bold">
                    ${(parseFloat(betAmount) * getOdds(selectedEvent, prediction)).toFixed(2)}
                  </span>
                </div>
                <Button className="w-full btn-casino" disabled={!isAuthenticated || placeBetMutation.isPending}
                  onClick={() => placeBetMutation.mutate()} data-testid="place-sports-bet-btn">
                  {placeBetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Place Bet
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Select a team to bet on
              </p>
            )}
          </div>

          {/* My Bets */}
          {isAuthenticated && myBets && myBets.length > 0 && (
            <div className="glass-panel rounded-xl p-4">
              <h3 className="font-display text-sm gold-text mb-3">My Bets</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {myBets.slice(0, 10).map(bet => (
                  <div key={bet.id} className="bg-muted/30 rounded-lg p-2 text-xs">
                    <div className="flex justify-between">
                      <span className="capitalize font-medium">{bet.prediction} @ {bet.odds}</span>
                      <span className={bet.status === "won" ? "text-green-400" : bet.status === "lost" ? "text-red-400" : "text-yellow-400"}>
                        {bet.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground">${bet.amount.toFixed(2)} — {bet.currency}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, selectedEvent, onSelect, prediction, setPrediction, isLive }: {
  event: SportsEvent; selectedEvent: SportsEvent | null; onSelect: (e: SportsEvent) => void;
  prediction: string; setPrediction: (p: string) => void; isLive?: boolean;
}) {
  const isSelected = selectedEvent?.id === event.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel rounded-xl p-4 ${isSelected ? "gold-glow border-primary/40" : ""}`}
      data-testid={`sports-event-${event.id}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary">{event.sport}</span>
          <span className="text-xs text-muted-foreground">{event.league}</span>
        </div>
        {isLive && (
          <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded animate-pulse">
            LIVE
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex-1">{event.homeTeam}</span>
        <span className="text-xs text-muted-foreground mx-2">vs</span>
        <span className="text-sm font-medium flex-1 text-right">{event.awayTeam}</span>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => { onSelect(event); setPrediction("home"); }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            isSelected && prediction === "home" ? "bg-primary text-background" : "bg-muted/50 text-foreground hover:bg-muted"
          }`}
          data-testid={`odds-home-${event.id}`}
        >
          {event.homeOdds}
        </button>
        {event.drawOdds && (
          <button
            onClick={() => { onSelect(event); setPrediction("draw"); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              isSelected && prediction === "draw" ? "bg-primary text-background" : "bg-muted/50 text-foreground hover:bg-muted"
            }`}
            data-testid={`odds-draw-${event.id}`}
          >
            {event.drawOdds}
          </button>
        )}
        <button
          onClick={() => { onSelect(event); setPrediction("away"); }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            isSelected && prediction === "away" ? "bg-primary text-background" : "bg-muted/50 text-foreground hover:bg-muted"
          }`}
          data-testid={`odds-away-${event.id}`}
        >
          {event.awayOdds}
        </button>
      </div>
    </motion.div>
  );
}
