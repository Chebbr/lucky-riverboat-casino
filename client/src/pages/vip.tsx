import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Star, Crown, Gem, Zap, Shield, Gift, Users, Headphones, Loader2 } from "lucide-react";

interface VIPProgress {
  currentTier: string;
  totalWagered: number;
  nextTierThreshold: number;
  rakebackEarned: number;
  rakebackClaimed: number;
}

const tiers = [
  {
    name: "Bronze",
    icon: "🥉",
    range: "0 – 999",
    color: "text-orange-400",
    borderColor: "border-orange-500/40",
    bgColor: "from-orange-600/20 to-orange-900/20",
    glowColor: "hover:shadow-orange-500/20",
    rakeback: "0.5%",
    weekly: "$5",
    monthly: "$10",
    support: false,
    host: false,
    tournaments: false,
  },
  {
    name: "Silver",
    icon: "🥈",
    range: "1K – 9,999",
    color: "text-slate-300",
    borderColor: "border-slate-400/40",
    bgColor: "from-slate-500/20 to-slate-800/20",
    glowColor: "hover:shadow-slate-400/20",
    rakeback: "1%",
    weekly: "$25",
    monthly: "$75",
    support: false,
    host: false,
    tournaments: false,
  },
  {
    name: "Gold",
    icon: "🥇",
    range: "10K – 49,999",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/40",
    bgColor: "from-yellow-600/20 to-yellow-900/20",
    glowColor: "hover:shadow-yellow-500/20",
    rakeback: "1.5%",
    weekly: "$100",
    monthly: "$400",
    support: true,
    host: false,
    tournaments: false,
  },
  {
    name: "Platinum",
    icon: "💎",
    range: "50K – 249,999",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/40",
    bgColor: "from-cyan-600/20 to-cyan-900/20",
    glowColor: "hover:shadow-cyan-500/20",
    rakeback: "2%",
    weekly: "$500",
    monthly: "$2,000",
    support: true,
    host: false,
    tournaments: true,
  },
  {
    name: "Diamond",
    icon: "👑",
    range: "250K+",
    color: "text-purple-400",
    borderColor: "border-purple-500/40",
    bgColor: "from-purple-600/20 to-purple-900/20",
    glowColor: "hover:shadow-purple-500/20",
    rakeback: "3%",
    weekly: "$2,500",
    monthly: "$10,000",
    support: true,
    host: true,
    tournaments: true,
  },
];

const benefits = [
  { icon: <Zap className="h-5 w-5 text-yellow-400" />, label: "Rakeback", desc: "Earn back a percentage of every bet, automatically credited to your wallet." },
  { icon: <Gift className="h-5 w-5 text-green-400" />, label: "Weekly Bonuses", desc: "Receive bonus funds every week based on your VIP tier." },
  { icon: <Star className="h-5 w-5 text-blue-400" />, label: "Monthly Bonuses", desc: "Larger monthly rewards for consistent play at higher tiers." },
  { icon: <Headphones className="h-5 w-5 text-orange-400" />, label: "Priority Support", desc: "Gold+ members get priority access to our support team." },
  { icon: <Crown className="h-5 w-5 text-purple-400" />, label: "Dedicated VIP Host", desc: "Diamond members get a personal host available 24/7." },
  { icon: <Trophy className="h-5 w-5 text-cyan-400" />, label: "Exclusive Tournaments", desc: "Platinum+ players are invited to private high-stakes tournaments." },
];

export default function VIPPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const { data: vipProgress, isLoading: progressLoading } = useQuery<VIPProgress>({
    queryKey: ["/api/vip/progress"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const claimRakebackMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/vip/claim-rakeback", {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vip/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      toast({ title: "Rakeback Claimed!", description: `$${data.amount?.toFixed(2) ?? "0.00"} added to your wallet.` });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const currentTierName = vipProgress?.currentTier || "Bronze";
  const unclaimedRakeback = vipProgress ? (vipProgress.rakebackEarned - vipProgress.rakebackClaimed) : 0;
  const progressPercent = vipProgress
    ? Math.min(100, (vipProgress.totalWagered / vipProgress.nextTierThreshold) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20 bg-black/20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[150px]" style={{ background: "oklch(0.78 0.12 85 / 0.08)" }} />
        </div>
        <div className="container relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">VIP Rewards Program</span>
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }} data-testid="vip-title">
              The <span className="gold-text-gradient">VIP Club</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Exclusive rewards, rakeback, bonuses, and personalized service for our most loyal players. The more you play, the more you earn back.
            </p>
            {!isAuthenticated && (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 glow-gold rounded-full uppercase tracking-widest" data-testid="vip-join-btn">
                <Link href="/auth">Join & Start Earning</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-16 relative">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10">
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-2">Progression System</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
              VIP <span className="gold-text-gradient">Tiers</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div
                  className={`bg-gradient-to-br ${tier.bgColor} border ${tier.borderColor} rounded-xl p-5 h-full hover:shadow-lg ${tier.glowColor} transition-all group relative ${
                    isAuthenticated && tier.name === currentTierName
                      ? "ring-2 ring-primary shadow-lg"
                      : ""
                  }`}
                  data-testid={`vip-tier-${tier.name.toLowerCase()}`}
                >
                  {isAuthenticated && tier.name === currentTierName && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-background text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Current Tier
                    </div>
                  )}
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{tier.icon}</div>
                  <h3 className={`text-xl font-bold mb-1 ${tier.color}`} style={{ fontFamily: "'Cinzel', serif" }}>{tier.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">${tier.range} wagered</p>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">Rakeback</span>
                      <span className={`font-bold ${tier.color}`}>{tier.rakeback}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">Weekly</span>
                      <span className="font-semibold">{tier.weekly}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">Monthly</span>
                      <span className="font-semibold">{tier.monthly}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs ${tier.support ? "text-green-400" : "text-muted-foreground/40 line-through"}`}>Priority Support</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs ${tier.tournaments ? "text-green-400" : "text-muted-foreground/40 line-through"}`}>Exclusive Tournaments</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs ${tier.host ? "text-green-400" : "text-muted-foreground/40 line-through"}`}>Dedicated Host</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 relative bg-black/20">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10">
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-2">Your Perks</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
              VIP <span className="gold-text-gradient">Benefits</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full hover:border-primary/30 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>{benefit.label}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[150px]" style={{ background: "oklch(0.78 0.12 85 / 0.05)" }} />
        </div>
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Cinzel', serif" }}>
                Your <span className="gold-text-gradient">Progress</span>
              </h2>

              {isAuthenticated ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8" data-testid="vip-progress-card">
                  {progressLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-4 w-2/3 mx-auto" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold flex items-center gap-2">
                          {tiers.find(t => t.name === currentTierName)?.icon} {currentTierName}
                        </span>
                        {vipProgress && vipProgress.nextTierThreshold < Infinity && (
                          <span className="text-muted-foreground font-bold flex items-center gap-2 text-sm">
                            Next Tier
                          </span>
                        )}
                      </div>
                      <Progress value={progressPercent} className="h-3 mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        You've wagered{" "}
                        <span className="text-foreground font-bold">${(vipProgress?.totalWagered ?? 0).toFixed(2)}</span>{" "}
                        {vipProgress && vipProgress.nextTierThreshold < Infinity && (
                          <>of <span className="text-foreground font-bold">${vipProgress.nextTierThreshold.toLocaleString()}</span> needed for the next tier.</>   
                        )}
                        {(!vipProgress || vipProgress.nextTierThreshold >= Infinity) && "— you've reached the highest tier!"}
                      </p>

                      {/* Rakeback */}
                      <div className="border-t border-white/10 pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Unclaimed Rakeback</span>
                          <span className="text-lg font-bold gold-text" data-testid="vip-unclaimed-rakeback">
                            ${unclaimedRakeback.toFixed(2)}
                          </span>
                        </div>
                        <Button
                          className="w-full btn-casino uppercase tracking-wider"
                          disabled={unclaimedRakeback <= 0 || claimRakebackMutation.isPending}
                          onClick={() => claimRakebackMutation.mutate()}
                          data-testid="vip-claim-rakeback-btn"
                        >
                          {claimRakebackMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          {unclaimedRakeback > 0 ? `Claim $${unclaimedRakeback.toFixed(2)} Rakeback` : "No Rakeback to Claim"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8" data-testid="vip-login-prompt">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>Sign In to View Progress</h3>
                  <p className="text-muted-foreground mb-6">Create an account or sign in to track your VIP progress and claim your rewards.</p>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full uppercase tracking-wider px-8" data-testid="vip-auth-btn">
                    <Link href="/auth">Sign In / Register</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ / Bottom CTA */}
      <section className="py-16 bg-black/20">
        <div className="container text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
              Questions? We've Got <span className="gold-text-gradient">Answers</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7. VIP members receive priority responses. Contact us through live chat or Discord.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 rounded-full px-6">
                Live Chat
              </Button>
              <Button variant="outline" className="border-white/20 hover:border-white/40 rounded-full px-6">
                Discord Server
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
