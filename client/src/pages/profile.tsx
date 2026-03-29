import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import type { Bet, Wallet } from "@shared/schema";
import {
  User,
  Crown,
  Target,
  TrendingUp,
  Trophy,
  Calendar,
  Wallet as WalletIcon,
  Users,
  ArrowDownToLine,
  ExternalLink,
  Percent,
} from "lucide-react";

const gameNames: Record<string, string> = {
  keno: "Riverboat Keno",
  roulette: "Roulette",
  mines: "Hidden Treasure",
  tower: "Walk the Plank",
  crash: "Beached",
  hilow: "Hitide Lowtide",
  helm: "Helm",
  blackjack: "Blackjack",
  slots: "Slots",
  plinko: "Plinko",
};

const tierColors: Record<string, string> = {
  none: "text-muted-foreground",
  bronze: "text-orange-400",
  silver: "text-gray-300",
  gold: "gold-text",
  platinum: "neon-text-cyan",
  diamond: "neon-text-pink",
  cabin_owner: "gold-text",
};

const tierBadgeColors: Record<string, string> = {
  none: "bg-muted/30 border-muted/50 text-muted-foreground",
  bronze: "bg-orange-400/20 border-orange-400/40 text-orange-400",
  silver: "bg-gray-400/20 border-gray-400/40 text-gray-300",
  gold: "bg-primary/20 border-primary/40 text-primary",
  platinum: "bg-cyan-400/20 border-cyan-400/40 text-cyan-300",
  diamond: "bg-pink-400/20 border-pink-400/40 text-pink-300",
  cabin_owner: "bg-primary/30 border-primary/60 text-primary",
};

function AuthGate() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <User className="w-12 h-12 text-primary mx-auto mb-4" />
      <h1
        className="text-2xl font-bold gold-text mb-4"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Player Profile
      </h1>
      <p className="text-muted-foreground mb-6">Sign in to view your profile and stats.</p>
      <Link href="/auth">
        <Button className="btn-casino" data-testid="btn-profile-login">
          Login / Register
        </Button>
      </Link>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated || !user) {
    return <AuthGate />;
  }

  const { data: betHistory, isLoading: betsLoading } = useQuery<Bet[]>({
    queryKey: ["/api/games/history"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const { data: vipStatus } = useQuery<any>({
    queryKey: ["/api/vip/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  // Compute aggregate stats
  const bets = betHistory || [];
  const totalGames = bets.length;
  const totalWagered = bets.reduce((s, b) => s + b.amount, 0);
  const totalWon = bets.reduce((s, b) => s + b.payout, 0);
  const wins = bets.filter((b) => b.payout > b.amount).length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  // VIP
  const currentTier = vipStatus?.currentTier || "none";
  const rakebackRate = vipStatus?.rakebackRate ?? 0;
  const vipProgress =
    vipStatus?.nextTier && vipStatus.totalWagered > 0
      ? Math.min(100, (vipStatus.totalWagered / vipStatus.nextTier.threshold) * 100)
      : 0;

  // Recent 20 bets
  const recentBets = bets.slice(0, 20);

  const stats = [
    {
      label: "Total Games",
      value: totalGames.toLocaleString(),
      icon: Target,
      testId: "stat-total-games",
    },
    {
      label: "Total Wagered",
      value: `$${totalWagered.toFixed(2)}`,
      icon: TrendingUp,
      testId: "stat-total-wagered",
    },
    {
      label: "Total Won",
      value: `$${totalWon.toFixed(2)}`,
      icon: Trophy,
      testId: "stat-total-won",
    },
    {
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      icon: Percent,
      testId: "stat-win-rate",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 pb-20 md:pb-10">
      <h1
        className="text-2xl font-bold gold-text mb-6"
        style={{ fontFamily: "'Cinzel', serif" }}
        data-testid="profile-title"
      >
        Player Profile
      </h1>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 mb-6 gold-glow"
        data-testid="profile-user-card"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-background">
              {user.username[0].toUpperCase()}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "'Cinzel', serif" }}
                data-testid="profile-username"
              >
                {user.username}
              </h2>
              <span
                className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border capitalize ${tierBadgeColors[currentTier]}`}
                data-testid="profile-vip-badge"
              >
                <Crown className="w-3 h-3 inline mr-1" />
                {currentTier === "cabin_owner" ? "Cabin Owner" : currentTier} VIP
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
              <Calendar className="w-3 h-3" />
              Member since{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "Recently"}
            </p>

            {/* VIP Progress */}
            <div className="space-y-1.5" data-testid="vip-progress">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  VIP Progress{" "}
                  {vipStatus?.nextTier && (
                    <span className="text-foreground/60">→ {vipStatus.nextTier.tier}</span>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {rakebackRate > 0 && (
                      <>
                        <span className="text-primary font-bold">{(rakebackRate * 100).toFixed(1)}%</span>{" "}
                        rakeback
                      </>
                    )}
                  </span>
                  {vipStatus?.nextTier && (
                    <span className="text-muted-foreground">
                      ${vipStatus.totalWagered?.toFixed(0)} /{" "}
                      ${vipStatus.nextTier.threshold?.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
              <Progress value={vipProgress} className="h-2" />
              {vipStatus?.nextTier && (
                <p className="text-xs text-muted-foreground">
                  ${vipStatus.nextTier.remaining?.toFixed(0)} more wagered to reach{" "}
                  <span className={`font-medium capitalize ${tierColors[vipStatus.nextTier.tier]}`}>
                    {vipStatus.nextTier.tier}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" data-testid="stats-row">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-panel rounded-xl p-4 text-center"
          >
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p
              className="text-lg font-bold gold-text"
              data-testid={stat.testId}
            >
              {betsLoading ? "—" : stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Wallet Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl p-5"
          data-testid="wallet-summary"
        >
          <h3
            className="text-sm font-bold gold-text mb-4 flex items-center gap-2"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <WalletIcon className="w-4 h-4 text-primary" />
            Wallet Summary
          </h3>
          {wallets && wallets.length > 0 ? (
            <div className="space-y-2">
              {wallets.map((w) => (
                <div
                  key={w.currency}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                  data-testid={`wallet-${w.currency}`}
                >
                  <span className="text-sm font-medium text-muted-foreground">{w.currency}</span>
                  <span className="text-sm font-bold text-foreground">
                    ${Number(w.balance).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No balances found.</p>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-panel rounded-xl p-5"
          data-testid="quick-actions"
        >
          <h3
            className="text-sm font-bold gold-text mb-4"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Quick Actions
          </h3>
          <div className="flex flex-col gap-2">
            <Link href="/wallet">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 text-sm"
                data-testid="btn-quick-deposit"
              >
                <ArrowDownToLine className="w-4 h-4 text-primary" />
                Deposit
              </Button>
            </Link>
            <Link href="/vip">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 text-sm"
                data-testid="btn-quick-rakeback"
              >
                <Crown className="w-4 h-4 text-primary" />
                Claim Rakeback
              </Button>
            </Link>
            <Link href="/affiliate">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 text-sm"
                data-testid="btn-quick-affiliate"
              >
                <Users className="w-4 h-4 text-primary" />
                View Affiliate Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* VIP Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-xl p-5"
        >
          <h3
            className="text-sm font-bold gold-text mb-4 flex items-center gap-2"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <Crown className="w-4 h-4 text-primary" />
            VIP Status
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Current Tier</p>
              <p
                className={`text-base font-bold capitalize ${tierColors[currentTier]}`}
                data-testid="profile-vip-tier"
              >
                {currentTier === "cabin_owner" ? "Cabin Owner" : currentTier}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Rakeback Rate</p>
              <p className="text-base font-bold text-primary" data-testid="profile-rakeback-rate">
                {(rakebackRate * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Total Wagered</p>
              <p className="text-sm font-medium text-foreground">
                ${vipStatus?.totalWagered?.toFixed(2) ?? "0.00"}
              </p>
            </div>
            <Link href="/vip">
              <Button
                size="sm"
                className="btn-casino w-full mt-2"
                data-testid="btn-view-vip"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                View VIP Club
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recent Games Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-panel rounded-xl p-5"
        data-testid="recent-games"
      >
        <h3
          className="text-sm font-bold gold-text mb-4 flex items-center gap-2"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          <Trophy className="w-4 h-4 text-primary" />
          Recent Games
        </h3>
        {betsLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : recentBets.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No games played yet. Visit the casino to get started!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Game
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Bet
                  </th>
                  <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Result
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Payout
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBets.map((bet, i) => {
                  const won = bet.payout > bet.amount;
                  const lost = bet.payout === 0;
                  return (
                    <tr
                      key={bet.id ?? i}
                      className="border-b border-border/20 last:border-0 hover:bg-white/3 transition-colors"
                      data-testid={`recent-bet-${i}`}
                    >
                      <td className="py-2.5 px-2 font-medium text-foreground">
                        {gameNames[bet.gameSlug] || bet.gameSlug}
                      </td>
                      <td className="py-2.5 px-2 text-right text-muted-foreground">
                        ${Number(bet.amount).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            won
                              ? "bg-green-500/20 text-green-400"
                              : lost
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {won ? "Win" : lost ? "Loss" : "Push"}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right font-bold ${
                          won ? "text-green-400" : "text-muted-foreground"
                        }`}
                      >
                        ${Number(bet.payout).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-xs text-muted-foreground hidden sm:table-cell">
                        {bet.createdAt
                          ? new Date(bet.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
