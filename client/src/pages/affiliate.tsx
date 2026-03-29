import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Copy, Users, DollarSign, Percent, ArrowRight, Loader2, UserPlus, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AffiliateDashboard {
  hasAccount: boolean;
  referralCode?: string;
  totalReferrals?: number;
  totalCommissionEarned?: number;
  commissionRate?: number;
}

interface AffiliateReferral {
  id: number;
  username: string;
  joinedAt: string;
  totalWagered: number;
  commissionEarned: number;
}

export default function AffiliatePage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: dashboard, isLoading } = useQuery<AffiliateDashboard>({
    queryKey: ["/api/affiliate/dashboard"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const { data: referrals, isLoading: referralsLoading } = useQuery<AffiliateReferral[]>({
    queryKey: ["/api/affiliate/referrals"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!dashboard?.hasAccount,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/affiliate/register", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate/dashboard"] });
      toast({ title: "Affiliate Account Created!", description: "Your referral code is ready to share." });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const referralLink = dashboard?.referralCode
    ? `${window.location.origin}/#/auth?ref=${dashboard.referralCode}`
    : "";

  const copyCode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    toast({ title: "Copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20 bg-black/20">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[150px]"
            style={{ background: "oklch(0.78 0.12 85 / 0.07)" }}
          />
        </div>
        <div className="container relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Share2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Affiliate Program</span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Cinzel', serif" }}
              data-testid="affiliate-title"
            >
              Earn With <span className="gold-text-gradient">The Riverboat</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Earn <span className="text-primary font-bold">5% commission</span> on every bet your referrals place — forever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-2">Simple</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
              How It <span className="gold-text-gradient">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Share2 className="w-7 h-7 text-primary" />, step: "01", title: "Share Your Link", desc: "Copy your unique referral link and share it with friends, on social media, or on Kick." },
              { icon: <UserPlus className="w-7 h-7 text-primary" />, step: "02", title: "Friends Sign Up", desc: "When someone clicks your link and registers, they're permanently linked to your affiliate account." },
              { icon: <DollarSign className="w-7 h-7 text-primary" />, step: "03", title: "Earn 5% Forever", desc: "You earn 5% of every bet they place — credited to your wallet automatically, for life." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center h-full hover:border-primary/30 transition-colors group relative">
                  <div className="absolute top-3 right-3 text-[10px] font-bold text-primary/40 tracking-widest">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard / Auth Gate */}
      <section className="py-10 bg-black/20">
        <div className="container max-w-4xl mx-auto">
          {!isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                Sign In to Join
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create an account or sign in to access your affiliate dashboard and start earning commissions.
              </p>
              <Button asChild className="btn-casino rounded-full px-8 uppercase tracking-wider" data-testid="affiliate-signin-btn">
                <Link href="/auth">Sign In / Register</Link>
              </Button>
            </motion.div>
          ) : isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : !dashboard?.hasAccount ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                Join the Affiliate Program
              </h3>
              <p className="text-muted-foreground mb-6">
                Register now to get your unique referral code and start earning 5% commissions.
              </p>
              <Button
                className="btn-casino rounded-full px-8 uppercase tracking-wider"
                onClick={() => registerMutation.mutate()}
                disabled={registerMutation.isPending}
                data-testid="affiliate-register-btn"
              >
                {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Register as Affiliate
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: <Users className="w-5 h-5 text-primary" />, label: "Total Referrals", value: dashboard.totalReferrals ?? 0 },
                  { icon: <DollarSign className="w-5 h-5 text-primary" />, label: "Total Commission Earned", value: `$${(dashboard.totalCommissionEarned ?? 0).toFixed(2)}` },
                  { icon: <Percent className="w-5 h-5 text-primary" />, label: "Commission Rate", value: `${((dashboard.commissionRate ?? 0.05) * 100).toFixed(0)}%` },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center" data-testid={`affiliate-stat-${stat.label.toLowerCase().replace(/ /g, '-')}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {stat.icon}
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold gold-text">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Referral Code */}
              <div className="bg-white/5 border border-primary/20 rounded-xl p-6" data-testid="affiliate-code-section">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                  Your Referral Code
                </h3>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 bg-black/30 rounded-lg px-4 py-3 font-mono text-lg font-bold text-primary border border-primary/30" data-testid="affiliate-code">
                    {dashboard.referralCode}
                  </div>
                  <Button
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => copyCode(dashboard.referralCode!)}
                    data-testid="affiliate-copy-code-btn"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>

                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Your Referral Link
                </h3>
                <div className="flex gap-3">
                  <Input
                    readOnly
                    value={referralLink}
                    className="bg-black/30 border-primary/20 font-mono text-xs text-foreground/70"
                    data-testid="affiliate-link"
                  />
                  <Button
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                    onClick={() => copyCode(referralLink)}
                    data-testid="affiliate-copy-link-btn"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>

              {/* Referrals Table */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                  Your Referrals
                </h3>
                {referralsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
                  </div>
                ) : !referrals || referrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No referrals yet. Share your link to get started!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-muted-foreground text-xs">Username</TableHead>
                          <TableHead className="text-muted-foreground text-xs">Joined</TableHead>
                          <TableHead className="text-muted-foreground text-xs">Total Wagered</TableHead>
                          <TableHead className="text-muted-foreground text-xs">Commission Earned</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.map((ref) => (
                          <TableRow key={ref.id} className="border-white/10" data-testid={`referral-row-${ref.id}`}>
                            <TableCell className="font-medium">{ref.username}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {ref.joinedAt ? new Date(ref.joinedAt).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell>${ref.totalWagered?.toFixed(2) ?? "0.00"}</TableCell>
                            <TableCell className="text-primary font-semibold">
                              ${ref.commissionEarned?.toFixed(2) ?? "0.00"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
