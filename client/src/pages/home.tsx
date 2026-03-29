import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, Star, Dot, TrendingUp } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import neonLogoPath from "@assets/Neon-Riverboat-Logo.png";

const games = [
  { name: "Riverboat Keno", path: "/games/keno", icon: "🎱", desc: "Pick your lucky numbers and watch the draw unfold", gradient: "from-blue-600/30 to-blue-900/40" },
  { name: "Beached", path: "/games/crash", icon: "🚀", desc: "Ride the wave and cash out before it crashes", gradient: "from-orange-600/30 to-orange-900/40" },
  { name: "Roulette", path: "/games/roulette", icon: "🎰", desc: "Place your bets and spin the wheel of fortune", gradient: "from-red-600/30 to-red-900/40" },
  { name: "Helm", path: "/games/helm", icon: "🎡", desc: "Spin the captain's wheel and claim your treasure", gradient: "from-purple-600/30 to-purple-900/40" },
  { name: "Walk the Plank", path: "/games/tower", icon: "🏴‍☠️", desc: "Climb the tower and avoid the traps", gradient: "from-yellow-600/30 to-yellow-900/40" },
  { name: "Hidden Treasure", path: "/games/mines", icon: "💎", desc: "Uncover gems while dodging hidden mines", gradient: "from-cyan-600/30 to-cyan-900/40" },
  { name: "Hitide Lowtide", path: "/games/hilow", icon: "🃏", desc: "Predict if the next card is higher or lower", gradient: "from-green-600/30 to-green-900/40" },
  { name: "Blackjack", path: "/games/blackjack", icon: "🃏", desc: "Beat the dealer to 21 without going over", gradient: "from-slate-600/30 to-slate-900/40" },
  { name: "Slots", path: "/games/slots", icon: "🎰", desc: "Spin the reels and match symbols for big wins", gradient: "from-pink-600/30 to-pink-900/40" },
  { name: "Plinko", path: "/games/plinko", icon: "⚪", desc: "Drop the ball and watch it bounce to multipliers", gradient: "from-indigo-600/30 to-indigo-900/40" },
];

const playerNames = ["Captn_Rex", "GoldRush22", "WaveCrash", "NeonKnight", "RiverKing", "SailMaster", "CryptoAce", "JackSpar", "BlazeWin", "LuckySteve", "CobraKai", "DiamondK", "PirateQ", "RollBig7", "WhaleHunter"];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function generateBet(id: number) {
  const game = games[randomBetween(0, games.length - 1)];
  const player = playerNames[randomBetween(0, playerNames.length - 1)];
  const bet = randomFloat(0.5, 500);
  const multiplier = randomFloat(0.1, 9.99);
  const payout = parseFloat((bet * multiplier).toFixed(2));
  const isWin = multiplier >= 1.0;
  const secsAgo = randomBetween(1, 59);
  return { id, game: game.name, icon: game.icon, player, time: `${secsAgo}s ago`, bet, multiplier, payout, isWin };
}

const TAB_OPTIONS = ["All Bets", "High Rollers", "Lucky Wins"] as const;

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [playerCounts] = useState(() => games.map(() => randomBetween(50, 500)));
  const [bets, setBets] = useState(() => Array.from({ length: 15 }, (_, i) => generateBet(i)));
  const [betCounter, setBetCounter] = useState(15);
  const [activeTab, setActiveTab] = useState<typeof TAB_OPTIONS[number]>("All Bets");

  // Auto-update bets every 2-3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBetCounter(c => {
        const newId = c + 1;
        const newBet = generateBet(newId);
        setBets(prev => [newBet, ...prev.slice(0, 14)]);
        return newId;
      });
    }, randomBetween(2000, 3000));
    return () => clearInterval(interval);
  }, []);

  const scrollCarousel = useCallback((dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  }, []);

  const filteredBets = bets.filter(b => {
    if (activeTab === "High Rollers") return b.bet >= 100;
    if (activeTab === "Lucky Wins") return b.isWin && b.multiplier >= 2;
    return true;
  });

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-16 md:py-20">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[150px]" style={{ background: "oklch(0.78 0.12 85 / 0.06)" }} />
        </div>

        {/* Gold dust particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${5 + (i * 4.7) % 92}%`,
                bottom: `${(i * 7) % 40}%`,
                width: i % 3 === 0 ? "3px" : "2px",
                height: i % 3 === 0 ? "3px" : "2px",
                background: i % 2 === 0 ? "oklch(0.85 0.10 85)" : "oklch(0.78 0.12 85)",
                boxShadow: "0 0 4px oklch(0.78 0.12 85 / 0.6)",
              }}
              animate={{ y: [0, -(180 + (i * 30) % 180)], x: [0, (i % 2 === 0 ? 1 : -1) * (10 + (i * 7) % 20)], opacity: [0, 0.9, 0.9, 0], scale: [0.5, 1.2, 0.8, 0] }}
              transition={{ duration: 4 + (i * 0.4) % 4, repeat: Infinity, delay: (i * 0.35) % 5, ease: "easeOut" }}
            />
          ))}
        </div>

        <div className="container relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Neon Logo */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(circle, oklch(0.78 0.12 85 / 0.18) 0%, transparent 70%)", filter: "blur(24px)", transform: "scale(1.3)" }} />
                <img
                  src={neonLogoPath}
                  alt="The Lucky Riverboat Casino & Sportsbook"
                  className="w-56 md:w-72 mx-auto relative rounded-2xl"
                  style={{ filter: "drop-shadow(0 0 40px oklch(0.78 0.12 85 / 0.35))", mixBlendMode: "screen" }}
                  data-testid="hero-logo"
                />
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">100% RTP &bull; 0% House Edge</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>

            {/* Heading */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }} data-testid="hero-title">
              The <span className="gold-text-gradient">First Casino</span> With <span className="gold-text-gradient">0% House Edge</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl">
              Welcome aboard The Lucky Riverboat — every game offers a true 100% Return to Player. No hidden edges, no unfair advantages. Just pure, transparent gaming.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 text-lg glow-gold rounded-full uppercase tracking-widest" data-testid="hero-register-btn">
                <Link href="/auth">Register</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 px-8 text-lg rounded-full uppercase tracking-widest" data-testid="hero-signin-btn">
                <Link href="/auth">Sign In</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trending Games Carousel ── */}
      <section className="py-10 bg-black/20 relative overflow-hidden">
        <div className="container relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <span>🔥</span> <span>Trending <span className="gold-text-gradient">Now</span></span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCarousel("left")}
                className="p-2 rounded-full bg-white/10 hover:bg-primary/20 border border-white/10 hover:border-primary/40 transition-all"
                data-testid="carousel-prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                className="p-2 rounded-full bg-white/10 hover:bg-primary/20 border border-white/10 hover:border-primary/40 transition-all"
                data-testid="carousel-next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {games.map((game, i) => (
              <Link key={game.path} href={game.path}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`flex-shrink-0 w-44 bg-gradient-to-br ${game.gradient} border border-white/10 rounded-xl p-4 cursor-pointer group hover:border-primary/50 hover:scale-105 transition-all`}
                  style={{ scrollSnapAlign: "start" }}
                  data-testid={`trending-card-${game.path.split("/").pop()}`}
                >
                  <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{game.icon}</span>
                  <h3 className="text-sm font-bold mb-1 leading-tight group-hover:text-primary transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>
                    {game.name}
                  </h3>
                  <span className="inline-block text-[10px] bg-primary/20 text-primary border border-primary/30 rounded-full px-2 py-0.5 font-bold mb-2">
                    100% RTP
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[11px] text-green-400 font-medium">{playerCounts[i]} playing</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promotions ── */}
      <section className="py-16 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[300px] rounded-full blur-[150px]" style={{ background: "oklch(0.78 0.12 85 / 0.05)" }} />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-2">Why We're Different</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
              Built for <span className="gold-text-gradient">Players</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: "⚖️",
                title: "0% House Edge",
                desc: "The only casino where you keep 100% of your winnings. Every game is provably fair. No hidden edges, no tricks — pure transparent gaming.",
                cta: "Learn More",
                href: "/casino",
                color: "from-yellow-600/20 to-yellow-900/20",
                border: "border-yellow-500/30",
                glow: "hover:shadow-yellow-500/10",
              },
              {
                icon: "⚓",
                title: "NFT Cabin Keys",
                desc: "Own a piece of the Riverboat. 444 unique cabins with revenue sharing. Holders earn passive income from the casino's profits.",
                cta: "Mint Now",
                href: "/nft",
                color: "from-cyan-600/20 to-cyan-900/20",
                border: "border-cyan-500/30",
                glow: "hover:shadow-cyan-500/10",
              },
              {
                icon: "🏆",
                title: "Live Sportsbook",
                desc: "Bet on NFL, NBA, MLB, NHL, Soccer & more with real-time ESPN data. Live betting with instant settlements.",
                cta: "Place Bets",
                href: "/sportsbook",
                color: "from-green-600/20 to-green-900/20",
                border: "border-green-500/30",
                glow: "hover:shadow-green-500/10",
              },
            ].map((promo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className={`bg-gradient-to-br ${promo.color} border ${promo.border} rounded-xl p-6 h-full flex flex-col hover:shadow-lg ${promo.glow} transition-all group`}>
                  <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{promo.icon}</span>
                  <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Cinzel', serif" }}>{promo.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 flex-1">{promo.desc}</p>
                  <Button asChild size="sm" className={`w-full bg-primary/20 hover:bg-primary/40 border ${promo.border} text-primary rounded-full uppercase tracking-wider text-xs font-bold`}>
                    <Link href={promo.href} data-testid={`promo-cta-${i}`}>{promo.cta}</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── House Originals ── */}
      <section className="py-16 relative bg-black/20">
        <div className="absolute pointer-events-none overflow-hidden w-full">
          <div className="mx-auto w-[500px] h-[300px] rounded-full blur-[150px]" style={{ background: "oklch(0.78 0.12 85 / 0.04)" }} />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-2">Exclusive Games</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3" style={{ fontFamily: "'Cinzel', serif" }}>
              <Star className="h-7 w-7 text-primary" />
              <span>House <span className="gold-text-gradient">Originals</span></span>
            </h2>
            <p className="text-muted-foreground text-sm">Custom-built games with 100% RTP</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {games.map((game, i) => (
              <motion.div
                key={game.path}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Link href={game.path}>
                  <div
                    className={`bg-gradient-to-br ${game.gradient} border border-white/10 backdrop-blur-sm rounded-xl p-4 text-center cursor-pointer group h-full hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 transition-all`}
                    data-testid={`game-card-${game.path.split("/").pop()}`}
                  >
                    <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{game.icon}</span>
                    <h3 className="text-sm font-bold mb-1 leading-tight group-hover:text-primary transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>
                      {game.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">{game.desc}</p>
                    <span className="inline-block text-[10px] bg-primary/20 text-primary border border-primary/30 rounded-full px-2 py-0.5 font-bold">
                      100% RTP
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] text-green-400">{playerCounts[i]} playing</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Bets Table ── */}
      <section className="py-16 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full blur-[120px]" style={{ background: "oklch(0.78 0.12 85 / 0.04)" }} />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                Live <span className="gold-text-gradient">Bets</span>
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {TAB_OPTIONS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                  data-testid={`bets-tab-${tab.replace(/ /g, "-").toLowerCase()}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-6 gap-2 px-4 py-3 border-b border-white/10 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Game</span>
                <span>Player</span>
                <span>Time</span>
                <span className="text-right">Bet</span>
                <span className="text-right">Multiplier</span>
                <span className="text-right">Payout</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
                <AnimatePresence initial={false}>
                  {filteredBets.slice(0, 15).map((bet) => (
                    <motion.div
                      key={bet.id}
                      initial={{ opacity: 0, y: -12, backgroundColor: "oklch(0.78 0.12 85 / 0.08)" }}
                      animate={{ opacity: 1, y: 0, backgroundColor: "oklch(0.78 0.12 85 / 0)" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="grid grid-cols-6 gap-2 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="text-base">{bet.icon}</span>
                        <span className="truncate text-xs text-muted-foreground">{bet.game}</span>
                      </span>
                      <span className="text-xs font-medium truncate self-center">{bet.player}</span>
                      <span className="text-xs text-muted-foreground self-center">{bet.time}</span>
                      <span className="text-xs text-right self-center font-mono">${bet.bet.toFixed(2)}</span>
                      <span className={`text-xs text-right self-center font-bold font-mono ${bet.multiplier >= 1 ? "text-green-400" : "text-red-400"}`}>
                        {bet.multiplier.toFixed(2)}x
                      </span>
                      <span className={`text-xs text-right self-center font-bold font-mono ${bet.isWin ? "text-green-400" : "text-red-400"}`}>
                        ${bet.payout.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Join Now CTA ── */}
      <section className="py-16 relative bg-black/20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[150px]" style={{ background: "oklch(0.78 0.12 85 / 0.06)" }} />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-3">All Aboard</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
              <span className="gold-text-gradient">Join Now</span> — It's Free
            </h2>
            <p className="text-muted-foreground mb-8">
              The only casino in the world with 0% house edge. Deposit with Bitcoin, Ethereum, or debit card and start playing instantly.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 text-lg glow-gold rounded-full uppercase tracking-widest"
              data-testid="cta-join-btn"
            >
              <Link href="/auth">Join Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
