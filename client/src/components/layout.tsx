import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import CardSuitsBackground from "@/components/card-suits-background";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Wallet } from "@shared/schema";
import { useState, useRef, useEffect, useCallback } from "react";
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
  Diamond,
  Search,
  Crown,
  Twitter,
  ExternalLink,
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

function SearchBar() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = games.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false);
      setQuery("");
      navigate(path);
    },
    [navigate]
  );

  return (
    <div className="relative hidden md:block" ref={ref}>
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 w-48 focus-within:border-primary/50 focus-within:bg-primary/5 transition-all">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search games..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(e.target.value.length > 0);
          }}
          onFocus={() => query.length > 0 && setOpen(true)}
          className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60 text-foreground"
          data-testid="search-input"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 mt-1.5 w-52 bg-card border border-border rounded-lg shadow-xl py-1.5 z-50">
          {filtered.map((game) => (
            <button
              key={game.path}
              onClick={() => handleSelect(game.path)}
              className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-muted/50 transition-colors text-sm"
              data-testid={`search-result-${game.path.split("/").pop()}`}
            >
              <span className="text-base">{game.icon}</span>
              <span className="font-medium">{game.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
      {/* Floating neon card suits */}
      <CardSuitsBackground />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md relative">
        <div className="container flex items-center justify-between h-16 gap-3">
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

          {/* Search Bar */}
          <SearchBar />

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
                        data-testid={`nav-game-${game.path.split("/").pop()}`}
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

            <Link href="/nft">
              <Button
                variant="ghost"
                className={`gap-2 ${isActive("/nft") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="nav-nft"
              >
                <Diamond className="h-4 w-4" />
                NFT
              </Button>
            </Link>

            <Link href="/vip">
              <Button
                variant="ghost"
                className={`gap-2 ${isActive("/vip") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="nav-vip"
              >
                <Crown className="h-4 w-4" />
                VIP
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

              <Link href="/nft">
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                    isActive("/nft") ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-nft"
                >
                  <Diamond className="h-4 w-4" />
                  NFT
                </button>
              </Link>

              <Link href="/vip">
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                    isActive("/vip") ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-vip"
                >
                  <Crown className="h-4 w-4" />
                  VIP
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
      <main className="flex-1 relative z-10 pb-16 md:pb-0">{children}</main>

      {/* Chat Overlay */}
      <ChatOverlay />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md" data-testid="mobile-bottom-nav">
        <div className="flex items-center justify-around h-16 px-2">
          <Link href="/">
            <button
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                location === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="mobile-nav-home"
            >
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-medium">Home</span>
            </button>
          </Link>
          <Link href="/casino">
            <button
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                location === "/casino" || location.startsWith("/games/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="mobile-nav-games"
            >
              <Gamepad2 className="h-5 w-5" />
              <span className="text-[10px] font-medium">Games</span>
            </button>
          </Link>
          <Link href="/sportsbook">
            <button
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                location === "/sportsbook" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="mobile-nav-sportsbook"
            >
              <Trophy className="h-5 w-5" />
              <span className="text-[10px] font-medium">Sports</span>
            </button>
          </Link>
          <Link href="/wallet">
            <button
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                location === "/wallet" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="mobile-nav-wallet"
            >
              <WalletIcon className="h-5 w-5" />
              <span className="text-[10px] font-medium">Wallet</span>
            </button>
          </Link>
          <Link href="/profile">
            <button
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                location === "/profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="mobile-nav-profile"
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Competitive Footer ── */}
      <footer className="border-t border-border/50 mt-auto relative z-10 bg-background/95">
        <div className="container py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">

            {/* Column 1: Logo + Tagline + Socials */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src={logoPath} alt="The Lucky Riverboat" className="w-9 h-9 rounded-full" />
                <span className="font-bold text-gold text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                  The Lucky Riverboat
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                The world's first 0% house edge casino. Provably fair. Crypto native. Built for players.
              </p>
              {/* Socials */}
              <div className="flex items-center gap-3">
                <a
                  href="https://twitter.com/luckyriverboat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all"
                  data-testid="footer-twitter"
                  aria-label="Twitter"
                >
                  <Twitter className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                </a>
                <a
                  href="https://discord.gg/luckyriverboat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all"
                  data-testid="footer-discord"
                  aria-label="Discord"
                >
                  <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                </a>
                <a
                  href="https://kick.com/x3bb3r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all"
                  data-testid="footer-kick"
                  aria-label="Kick.com"
                >
                  <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h4v8l6-8h5l-6.5 8.5L17 22h-5l-4-7-2 2.5V22H2V2z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Casino */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wider">Casino</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  { label: "House Originals", href: "/casino" },
                  { label: "All Games", href: "/casino" },
                  { label: "Provably Fair", href: "/provably-fair" },
                  { label: "Promotions", href: "/casino" },
                  { label: "VIP Club", href: "/vip" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Sports */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wider">Sports</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  { label: "Sportsbook", href: "/sportsbook" },
                  { label: "NFL", href: "/sportsbook" },
                  { label: "NBA", href: "/sportsbook" },
                  { label: "MLB", href: "/sportsbook" },
                  { label: "Soccer", href: "/sportsbook" },
                  { label: "Live Betting", href: "/sportsbook" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Company */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  { label: "About", href: "/" },
                  { label: "NFT Collection", href: "/nft" },
                  { label: "Whitepaper", href: "/" },
                  { label: "Affiliate Program", href: "/" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Support */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-foreground uppercase tracking-wider">Support</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  { label: "Help Center", href: "/" },
                  { label: "Responsible Gaming", href: "/" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Contact", href: "/" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Deposit address */}
          <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/60">Deposit Address:</span>{" "}
              <span className="font-mono text-[11px] text-muted-foreground/80 select-all">
                0xCd48AebB3B83A65a8f5187Fe8471905D270c3236
              </span>
            </p>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} The Lucky Riverboat Casino &amp; Sportsbook. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span className="text-primary/70 font-semibold">Crypto Only &bull; 0% House Edge &bull; Provably Fair</span>
              <span className="bg-primary/20 border border-primary/30 text-primary font-bold rounded px-2 py-0.5">18+</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
