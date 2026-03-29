import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { Wallet as WalletType, Transaction } from "@shared/schema";
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, History, Loader2, Copy } from "lucide-react";
import { Link } from "wouter";

export default function WalletPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [depositCurrency, setDepositCurrency] = useState("USDT");
  const [depositAmount, setDepositAmount] = useState("100");
  const [withdrawCurrency, setWithdrawCurrency] = useState("USDT");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <WalletIcon className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-2xl gold-text mb-4">Crypto Wallet</h1>
        <p className="text-muted-foreground mb-6">Login to manage your crypto balances</p>
        <Link href="/auth">
          <Button className="btn-casino">Login / Register</Button>
        </Link>
      </div>
    );
  }

  const { data: wallets } = useQuery<WalletType[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/wallet/transactions"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const depositMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/wallet/deposit", {
        currency: depositCurrency, amount: parseFloat(depositAmount),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({ title: "Deposit Successful", description: `$${depositAmount} ${depositCurrency} added` });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/wallet/withdraw", {
        currency: withdrawCurrency, amount: parseFloat(withdrawAmount), address: withdrawAddress,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({ title: "Withdrawal Submitted", description: "Pending admin approval" });
      setWithdrawAmount("");
      setWithdrawAddress("");
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const currencyIcons: Record<string, string> = { BTC: "₿", ETH: "Ξ", USDT: "$" };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <WalletIcon className="w-6 h-6 text-primary" />
        <h1 className="font-display text-2xl gold-text" data-testid="wallet-title">Crypto Wallet</h1>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {wallets?.map(w => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-xl p-5 gold-glow"
            data-testid={`wallet-card-${w.currency}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{w.currency}</span>
              <span className="text-2xl">{currencyIcons[w.currency]}</span>
            </div>
            <p className="text-2xl font-bold gold-text">{w.balance.toFixed(w.currency === "BTC" ? 8 : 4)}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <span className="truncate">{w.address}</span>
              <button onClick={() => { navigator.clipboard?.writeText(w.address); toast({ title: "Copied!" }); }}>
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="deposit">
        <TabsList className="bg-muted/50 mb-4">
          <TabsTrigger value="deposit" data-testid="tab-deposit">
            <ArrowDownLeft className="w-3 h-3 mr-1" /> Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" data-testid="tab-withdraw">
            <ArrowUpRight className="w-3 h-3 mr-1" /> Withdraw
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <History className="w-3 h-3 mr-1" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <div className="glass-panel rounded-xl p-6 max-w-md">
            <h3 className="font-display text-lg gold-text mb-4">Deposit Crypto</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Currency</label>
                <div className="flex gap-2 mt-1">
                  {["BTC", "ETH", "USDT"].map(c => (
                    <Button key={c} variant={depositCurrency === c ? "default" : "outline"} size="sm"
                      onClick={() => setDepositCurrency(c)}
                      className={depositCurrency === c ? "btn-casino" : "border-primary/30 text-primary"}
                      data-testid={`deposit-currency-${c}`}>
                      {c}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Amount</label>
                <Input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                  className="bg-muted/50 border-border" data-testid="deposit-amount-input" min="1" />
              </div>
              <p className="text-xs text-muted-foreground">
                Send crypto to your deposit address below. Deposits are confirmed after network verification.
              </p>
              <Button className="w-full btn-casino" disabled={depositMutation.isPending}
                onClick={() => depositMutation.mutate()} data-testid="deposit-btn">
                {depositMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Deposit {depositAmount} {depositCurrency}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="withdraw">
          <div className="glass-panel rounded-xl p-6 max-w-md">
            <h3 className="font-display text-lg gold-text mb-4">Withdraw Crypto</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Currency</label>
                <div className="flex gap-2 mt-1">
                  {["BTC", "ETH", "USDT"].map(c => (
                    <Button key={c} variant={withdrawCurrency === c ? "default" : "outline"} size="sm"
                      onClick={() => setWithdrawCurrency(c)}
                      className={withdrawCurrency === c ? "btn-casino" : "border-primary/30 text-primary"}
                      data-testid={`withdraw-currency-${c}`}>
                      {c}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Amount</label>
                <Input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                  className="bg-muted/50 border-border" data-testid="withdraw-amount-input" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Destination Address</label>
                <Input value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)}
                  className="bg-muted/50 border-border" data-testid="withdraw-address-input" placeholder="Enter wallet address" />
              </div>
              <Button className="w-full btn-casino" disabled={withdrawMutation.isPending || !withdrawAmount}
                onClick={() => withdrawMutation.mutate()} data-testid="withdraw-btn">
                {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Withdraw
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="glass-panel rounded-xl p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Amount</th>
                  <th className="text-left py-2 px-3">Currency</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.slice(0, 50).map(tx => (
                  <tr key={tx.id} className="border-b border-border/50" data-testid={`tx-row-${tx.id}`}>
                    <td className="py-2 px-3 capitalize">{tx.type}</td>
                    <td className={`py-2 px-3 font-medium ${tx.type === "win" || tx.type === "deposit" ? "text-green-400" : tx.type === "bet" || tx.type === "withdraw" ? "text-red-400" : ""}`}>
                      {tx.type === "win" || tx.type === "deposit" || tx.type === "bonus" ? "+" : "-"}{tx.amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-3">{tx.currency}</td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        tx.status === "completed" ? "bg-green-500/20 text-green-400" :
                        tx.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>{tx.status}</span>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground text-xs">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!transactions || transactions.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
