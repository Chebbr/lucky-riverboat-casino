import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Wallet } from "@shared/schema";
import { useState } from "react";
import {
  Home, Gamepad2, Trophy, Wallet as WalletIcon, User, Shield, LogOut, Menu, X, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logoPath from "@assets/Poker-Chip-Logo.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const usdtBalance = wallets?.find(w => w.currency === "USDT")?.balance || 0;

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/casino", label: "Casino", icon: Gamepad2 },
    { href: "/sportsbook", label: "Sportsbook", icon: Trophy },
    ...(isAuthenticated ? [
      { href: "/wallet", label: "Wallet", icon: WalletIcon },
      { href: "/profile", label: "Profile", icon: User },
    ] : []),
    ...(isAuthenticated && user?.role === "admin" ? [
      { href: "/admin", label: "Admin", icon: Shield },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 glass-panel-strong border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src={logoPath} alt="Lucky Riverboat" className="w-10 h-10" />
            <span className="font-display text-lg gold-text hidden sm:block" data-testid="nav-logo-text">
              Lucky Riverboat
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    location === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 glass-panel rounded-lg px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">USDT</span>
                  <span className="text-sm font-bold gold-text" data-testid="nav-balance">
                    ${usdtBalance.toFixed(2)}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground" data-testid="nav-username">{user?.username}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout.mutate()}
                    data-testid="btn-logout"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/auth">
                <Button className="btn-casino text-sm" data-testid="btn-login-nav">
                  Login / Register
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="btn-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                        location === item.href ? "text-primary bg-primary/10" : "text-muted-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </span>
                  </Link>
                ))}
                {isAuthenticated && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm text-muted-foreground">Balance: <span className="gold-text font-bold">${usdtBalance.toFixed(2)}</span></span>
                      <Button variant="ghost" size="sm" onClick={() => { logout.mutate(); setMobileMenuOpen(false); }}>
                        <LogOut className="w-4 h-4 mr-1" /> Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logoPath} alt="Lucky Riverboat" className="w-8 h-8" />
            <span className="font-display gold-text">The Lucky Riverboat Casino</span>
          </div>
          <p className="text-xs text-muted-foreground">
            100% RTP &bull; 0% House Edge &bull; Crypto Only &bull; Play Responsibly
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            &copy; 2026 The Lucky Riverboat Casino & Sportsbook. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
