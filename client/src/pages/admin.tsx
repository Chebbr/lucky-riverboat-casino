import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Game, Transaction, BonusCode } from "@shared/schema";
import {
  Shield, Users, Gamepad2, CreditCard, Gift, TrendingUp, DollarSign, Activity, Loader2,
} from "lucide-react";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h1 className="font-display text-2xl text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Admin privileges required</p>
        <Link href="/auth">
          <Button className="btn-casino">Login as Admin</Button>
        </Link>
      </div>
    );
  }

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: allUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: gameList } = useQuery<Game[]>({
    queryKey: ["/api/admin/games"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: pendingWithdrawals } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/withdrawals"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: bonusCodes } = useQuery<BonusCode[]>({
    queryKey: ["/api/admin/bonuses"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/admin/withdrawals/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal approved" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/admin/withdrawals/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal rejected" });
    },
  });

  const [newBonus, setNewBonus] = useState({ code: "", type: "fixed", value: "100", maxUses: "100" });
  const createBonusMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/bonuses", {
        code: newBonus.code, type: newBonus.type,
        value: parseFloat(newBonus.value), maxUses: parseInt(newBonus.maxUses),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bonuses"] });
      toast({ title: "Bonus code created" });
      setNewBonus({ code: "", type: "fixed", value: "100", maxUses: "100" });
    },
  });

  const updateRtpMutation = useMutation({
    mutationFn: async ({ id, rtp }: { id: number; rtp: number }) => {
      await apiRequest("POST", `/api/admin/games/${id}/rtp`, { rtp });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/games"] });
      toast({ title: "RTP updated" });
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="font-display text-2xl gold-text" data-testid="admin-title">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Wagered", value: `$${(stats?.totalWagered || 0).toFixed(0)}`, icon: DollarSign, color: "text-green-400" },
          { label: "House Profit", value: `$${(stats?.houseProfit || 0).toFixed(0)}`, icon: TrendingUp, color: "gold-text" },
          { label: "Users", value: stats?.userCount || 0, icon: Users, color: "neon-text-cyan" },
          { label: "Active Sessions", value: stats?.activeSessions || 0, icon: Activity, color: "neon-text-pink" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel rounded-xl p-4" data-testid={`admin-stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
            <s.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="bg-muted/50 mb-4">
          <TabsTrigger value="users" data-testid="admin-tab-users"><Users className="w-3 h-3 mr-1" /> Users</TabsTrigger>
          <TabsTrigger value="games" data-testid="admin-tab-games"><Gamepad2 className="w-3 h-3 mr-1" /> Games</TabsTrigger>
          <TabsTrigger value="withdrawals" data-testid="admin-tab-withdrawals"><CreditCard className="w-3 h-3 mr-1" /> Withdrawals</TabsTrigger>
          <TabsTrigger value="bonuses" data-testid="admin-tab-bonuses"><Gift className="w-3 h-3 mr-1" /> Bonuses</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="glass-panel rounded-xl p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-3">ID</th>
                  <th className="text-left py-2 px-3">Username</th>
                  <th className="text-left py-2 px-3">Role</th>
                  <th className="text-left py-2 px-3">VIP Tier</th>
                  <th className="text-left py-2 px-3">Total Wagered</th>
                </tr>
              </thead>
              <tbody>
                {allUsers?.map(u => (
                  <tr key={u.id} className="border-b border-border/50" data-testid={`admin-user-${u.id}`}>
                    <td className="py-2 px-3">{u.id}</td>
                    <td className="py-2 px-3 font-medium">{u.username}</td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 px-3 capitalize">{u.vipTier}</td>
                    <td className="py-2 px-3 gold-text">${u.totalWagered?.toFixed(0) || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="games">
          <div className="glass-panel rounded-xl p-4">
            <div className="space-y-3">
              {gameList?.map(game => (
                <div key={game.id} className="flex items-center justify-between bg-muted/20 rounded-lg p-3"
                  data-testid={`admin-game-${game.slug}`}>
                  <div>
                    <p className="font-medium">{game.name}</p>
                    <p className="text-xs text-muted-foreground">Slug: {game.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">RTP</p>
                      <p className="text-sm font-bold gold-text">{game.rtp}%</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="text-xs border-primary/30"
                        onClick={() => updateRtpMutation.mutate({ id: game.id, rtp: Math.min(100, game.rtp + 1) })}>
                        +1
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs border-primary/30"
                        onClick={() => updateRtpMutation.mutate({ id: game.id, rtp: Math.max(80, game.rtp - 1) })}>
                        -1
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="withdrawals">
          <div className="glass-panel rounded-xl p-4">
            {(!pendingWithdrawals || pendingWithdrawals.length === 0) ? (
              <p className="text-center text-muted-foreground py-8">No pending withdrawals</p>
            ) : (
              <div className="space-y-2">
                {pendingWithdrawals.map(w => (
                  <div key={w.id} className="flex items-center justify-between bg-muted/20 rounded-lg p-3"
                    data-testid={`admin-withdrawal-${w.id}`}>
                    <div>
                      <p className="text-sm font-medium">User #{w.userId}</p>
                      <p className="text-xs text-muted-foreground">{w.amount} {w.currency}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        onClick={() => approveMutation.mutate(w.id)}
                        disabled={approveMutation.isPending}
                        data-testid={`approve-withdrawal-${w.id}`}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="text-xs"
                        onClick={() => rejectMutation.mutate(w.id)}
                        disabled={rejectMutation.isPending}
                        data-testid={`reject-withdrawal-${w.id}`}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bonuses">
          <div className="glass-panel rounded-xl p-4 space-y-4">
            <h3 className="font-display text-sm gold-text">Create Bonus Code</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input placeholder="CODE" value={newBonus.code}
                onChange={e => setNewBonus({ ...newBonus, code: e.target.value.toUpperCase() })}
                className="bg-muted/50 border-border" data-testid="bonus-code-input" />
              <select value={newBonus.type} onChange={e => setNewBonus({ ...newBonus, type: e.target.value })}
                className="bg-muted/50 border border-border rounded-md px-3 text-sm text-foreground"
                data-testid="bonus-type-select">
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
              <Input placeholder="Value" type="number" value={newBonus.value}
                onChange={e => setNewBonus({ ...newBonus, value: e.target.value })}
                className="bg-muted/50 border-border" data-testid="bonus-value-input" />
              <Button className="btn-casino" onClick={() => createBonusMutation.mutate()}
                disabled={!newBonus.code || createBonusMutation.isPending}
                data-testid="create-bonus-btn">
                Create
              </Button>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-xs text-muted-foreground mb-2">Existing Codes</h4>
              {bonusCodes?.map(bc => (
                <div key={bc.id} className="flex items-center justify-between bg-muted/20 rounded-lg p-2 mb-1"
                  data-testid={`bonus-${bc.code}`}>
                  <div>
                    <span className="text-sm font-mono font-bold text-primary">{bc.code}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {bc.type === "fixed" ? `$${bc.value}` : `${bc.value}%`}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{bc.currentUses}/{bc.maxUses} uses</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
