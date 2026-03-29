import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Wallet } from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import {
  Home,
  Gamepad2,
  Trophy,
  LayoutDashboard,
  Wallet as WalletIcon,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatOverlay from "@/components/chat-overlay";
import logoPath from "@assets/Poker-Chip-Logo.png";

const games = [
  { name: "Riverboat Keno", path: "/games/keno", icon: "🎱" },
  { name: "Beached", path: "/games/crash", icon: "🚀" },
  { name: "Roulette", path: "/games/roulette", icon: "🎰" },
  { name: "Helm", path: "/games/helm", icon: "🎡" },
  { name: "Walk the Plank", path: "/games/tower", icon: "🏴‍☠️" },
  { name: "Hidden Treasure", path: "/games/mines", icon: "💎" },
  { name: "Hitide Lowtide", path: "/games/hilow", icon: "🃏" },
  { name: "Blackjack", path: "/games/blackjack", icon: "🃏" },
  { name: "Slots", path: "/games/slots", icon: "🎰" },
  { name: "Plinko", path: "/games/plinko", icon: "⚪" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gamesDropdownOpen, setGamesDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const gamesRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallet/balances"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const usdtBalance = wallets?.find(w => w.currency === "USDT")?.balance || 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (gamesRef.current && !gamesRef.current.contains(e.target as Node)) {
        setGamesDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location === path;
  const isGameActive = location.startsWith("/games/");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src={logoPath}
              alt="The Lucky Riverboat"
              className="h-10 w-10 rounded-full object-cover"
              data-testid="nav-logo"
            />
            <span
              className="text-lg font-bold text-gold hidden sm:block"
              style={{ fontFamily: "'Cinzel', serif" }}
              data-testid="nav-logo-text"
            >
              The Lucky Riverboat
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button
                variant="ghost"
                className={`gap-2 ${isActive("/") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="nav-home"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>

            {/* Games Dropdown */}
            <div className="relative" ref={gamesRef}>
              <Button
                variant="ghost"
                className={`gap-2 ${isGameActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setGamesDropdownOpen(!gamesDropdownOpen)}
                data-testid="nav-games-dropdown"
              >
                <Gamepad2 className="h-4 w-4" />
                Games
                <ChevronDown className={`h-3 w-3 transition-transform ${gamesDropdownOpen ? "rotate-180" : ""}`} />
              </Button>
              {gamesDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-xl py-2 z-50">
                  {games.map((game) => (
                    <Link key={game.path} href={game.path}>
                      <button
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                          isActive(game.path) ? "text-primary bg-primary/10" : "text-foreground"
                        }`}
                        onClick={() => setGamesDropdownOpen(false)}
                        data-testid={`nav-game-${game.path.split('/').pop()}`}
                      >
                        <span className="text-lg">{game.icon}</span>
                        <span className="text-sm font-medium">{game.name}</span>
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/sportsbook">
              <Button
                variant="ghost"
                className={`gap-2 ${isActive("/sportsbook") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="nav-sportsbook"
              >
                <Trophy className="h-4 w-4" />
                Sportsbook
              </Button>
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/wallet">
                  <Button
                    variant="ghost"
                    className={`gap-2 ${isActive("/wallet") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                    data-testid="nav-wallet"
                  >
                    <WalletIcon className="h-4 w-4" />
                    Wallet
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Right Side: Balance + User Area */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Balance pill */}
                <div className="hidden sm:flex items-center gap-2 glass-panel rounded-lg px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">USDT</span>
                  <span className="text-sm font-bold text-gold" data-testid="nav-balance">
                    ${usdtBalance.toFixed(2)}
                  </span>
                </div>

                {/* User dropdown */}
                <div className="relative" ref={userRef}>
                  <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    data-testid="nav-user-dropdown"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {user.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm">{user.username || "Player"}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-xl py-2 z-50">
                      <Link href="/profile">
                        <button
                          className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-sm"
                          onClick={() => setUserDropdownOpen(false)}
                          data-testid="dropdown-profile"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </button>
                      </Link>
                      <Link href="/wallet">
                        <button
                          className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-sm"
                          onClick={() => setUserDropdownOpen(false)}
                          data-testid="dropdown-wallet"
                        >
                          <WalletIcon className="h-4 w-4" />
                          Wallet
                        </button>
                      </Link>
                      {user.role === "admin" && (
                        <Link href="/admin">
                          <button
                            className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-sm text-gold"
                            onClick={() => setUserDropdownOpen(false)}
                            data-testid="dropdown-admin"
                          >
                            <Settings className="h-4 w-4" />
                            Admin Dashboard
                          </button>
                        </Link>
                      )}
                      <hr className="my-1 border-border" />
                      <button
                        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-sm text-red-400"
                        onClick={() => logout.mutate()}
                        data-testid="dropdown-logout"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/auth">
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid="btn-login-nav"
                >
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="btn-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="container py-4 space-y-1">
              <Link href="/">
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                    isActive("/") ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  Home
                </button>
              </Link>

              <div className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider">Games</div>
              {games.map((game) => (
                <Link key={game.path} href={game.path}>
                  <button
                    className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 ${
                      isActive(game.path) ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{game.icon}</span>
                    {game.name}
                  </button>
                </Link>
              ))}

              <Link href="/sportsbook">
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                    isActive("/sportsbook") ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy className="h-4 w-4" />
                  Sportsbook
                </button>
              </Link>

              {isAuthenticated && (
                <>
                  <Link href="/wallet">
                    <button
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                        isActive("/wallet") ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <WalletIcon className="h-4 w-4" />
                      Wallet
                    </button>
                  </Link>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-muted-foreground">
                        Balance: <span className="text-gold font-bold">${usdtBalance.toFixed(2)}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { logout.mutate(); setMobileMenuOpen(false); }}
                      >
                        <LogOut className="w-4 h-4 mr-1" /> Logout
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Chat Overlay */}
      <ChatOverlay />

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src={logoPath} alt="The Lucky Riverboat" className="w-8 h-8 rounded-full" />
            <span className="font-bold text-gold" style={{ fontFamily: "'Cinzel', serif" }}>
              The Lucky Riverboat Casino
            </span>
          </div>
          <p>&copy; {new Date().getFullYear()} The Lucky Riverboat Casino & Sportsbook. All rights reserved.</p>
          <p className="mt-1">Play responsibly. Must be 18+ to participate.</p>
        </div>
      </footer>
    </div>
  );
}
