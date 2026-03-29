import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import type { Bet } from "@shared/schema";
import { User, Crown, Target, TrendingUp, Trophy, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <User className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-2xl gold-text mb-4">Player Profile</h1>
        <p className="text-muted-foreground mb-6">Login to view your profile</p>
        <Link href="/auth">
          <Button className="btn-casino">Login / Register</Button>
        </Link>
      </div>
    );
  }

  const { data: betHistory } = useQuery<Bet[]>({
    queryKey: ["/api/games/history"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const { data: vipStatus } = useQuery<any>({
    queryKey: ["/api/vip/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  // Compute stats per game
  const gameStats = (betHistory || []).reduce((acc: Record<string, any>, bet) => {
    if (!acc[bet.gameSlug]) {
      acc[bet.gameSlug] = { totalBets: 0, wins: 0, wagered: 0, biggestWin: 0 };
    }
    acc[bet.gameSlug].totalBets++;
    acc[bet.gameSlug].wagered += bet.amount;
    if (bet.payout > 0) {
      acc[bet.gameSlug].wins++;
      acc[bet.gameSlug].biggestWin = Math.max(acc[bet.gameSlug].biggestWin, bet.payout);
    }
    return acc;
  }, {});

  const totalBets = betHistory?.length || 0;
  const totalWins = betHistory?.filter(b => b.payout > 0).length || 0;
  const totalWagered = betHistory?.reduce((s, b) => s + b.amount, 0) || 0;
  const biggestWin = betHistory?.reduce((max, b) => Math.max(max, b.payout), 0) || 0;

  const gameNames: Record<string, string> = {
    keno: "Riverboat Keno", roulette: "Roulette", mines: "Hidden Treasure",
    tower: "Walk the Plank", crash: "Beached", hilow: "Hitide Lowtide", helm: "Helm",
  };

  const tierColors: Record<string, string> = {
    none: "text-muted-foreground", bronze: "text-orange-400", silver: "text-gray-300",
    gold: "gold-text", platinum: "neon-text-cyan", diamond: "neon-text-pink",
    cabin_owner: "gold-text",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-primary" />
        <h1 className="font-display text-2xl gold-text" data-testid="profile-title">Player Profile</h1>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 mb-6 gold-glow">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center">
            <span className="text-2xl font-bold text-background">{user.username[0].toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold" data-testid="profile-username">{user.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Crown className="w-4 h-4 text-primary" />
              <span className={`text-sm font-medium capitalize ${tierColors[vipStatus?.currentTier || "none"]}`}
                data-testid="profile-vip-tier">
                {vipStatus?.currentTier || "none"} VIP
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
            </p>
          </div>
        </div>

        {/* VIP Progress */}
        {vipStatus?.nextTier && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>VIP Progress</span>
              <span>${vipStatus.totalWagered.toFixed(0)} / ${vipStatus.nextTier.threshold.toFixed(0)}</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2">
              <div className="gold-gradient h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (vipStatus.totalWagered / vipStatus.nextTier.threshold) * 100)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${vipStatus.nextTier.remaining.toFixed(0)} more to reach {vipStatus.nextTier.tier}
            </p>
          </div>
        )}
      </motion.div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Bets", value: totalBets.toString(), icon: Target },
          { label: "Win Rate", value: totalBets > 0 ? `${((totalWins / totalBets) * 100).toFixed(1)}%` : "0%", icon: TrendingUp },
          { label: "Total Wagered", value: `$${totalWagered.toFixed(0)}`, icon: Trophy },
          { label: "Biggest Win", value: `$${biggestWin.toFixed(2)}`, icon: Crown },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel rounded-xl p-4 text-center">
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-bold gold-text" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Per Game Stats */}
      <h3 className="font-display text-lg gold-text mb-4">Game Statistics</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {Object.entries(gameStats).map(([slug, stats]: [string, any]) => (
          <motion.div key={slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-panel rounded-xl p-4" data-testid={`game-stats-${slug}`}>
            <h4 className="font-display text-sm gold-text mb-2">{gameNames[slug] || slug}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Bets:</span> <span className="font-medium">{stats.totalBets}</span></div>
              <div><span className="text-muted-foreground">Win Rate:</span> <span className="font-medium">{((stats.wins / stats.totalBets) * 100).toFixed(1)}%</span></div>
              <div><span className="text-muted-foreground">Wagered:</span> <span className="font-medium">${stats.wagered.toFixed(0)}</span></div>
              <div><span className="text-muted-foreground">Biggest Win:</span> <span className="font-medium gold-text">${stats.biggestWin.toFixed(2)}</span></div>
            </div>
          </motion.div>
        ))}
        {Object.keys(gameStats).length === 0 && (
          <p className="text-muted-foreground col-span-2 text-center py-8">No games played yet. Visit the casino to get started!</p>
        )}
      </div>
    </div>
  );
}
