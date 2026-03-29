import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, ExternalLink } from "lucide-react";
import WagerFeedWidget from "@/components/wager-feed-widget";
import neonLogoPath from "@assets/Neon-Riverboat-Logo.png";
import meetXebbPath from "@assets/Meet-Xebb.jpg";

const games = [
  { name: "Riverboat Keno", path: "/games/keno", icon: "🎱", desc: "Pick your lucky numbers and watch the draw unfold", gradient: "from-blue-600/20 to-blue-900/20" },
  { name: "Beached", path: "/games/crash", icon: "🚀", desc: "Ride the wave and cash out before it crashes", gradient: "from-orange-600/20 to-orange-900/20" },
  { name: "Roulette", path: "/games/roulette", icon: "🎰", desc: "Place your bets and spin the wheel of fortune", gradient: "from-red-600/20 to-red-900/20" },
  { name: "Helm", path: "/games/helm", icon: "🎡", desc: "Spin the captain's wheel and claim your treasure", gradient: "from-purple-600/20 to-purple-900/20" },
  { name: "Walk the Plank", path: "/games/tower", icon: "🏴‍☠️", desc: "Climb the tower and avoid the traps", gradient: "from-yellow-600/20 to-yellow-900/20" },
  { name: "Hidden Treasure", path: "/games/mines", icon: "💎", desc: "Uncover gems while dodging hidden mines", gradient: "from-cyan-600/20 to-cyan-900/20" },
  { name: "Hitide Lowtide", path: "/games/hilow", icon: "🃏", desc: "Predict if the next card is higher or lower", gradient: "from-green-600/20 to-green-900/20" },
  { name: "Blackjack", path: "/games/blackjack", icon: "🃏", desc: "Beat the dealer to 21 without going over", gradient: "from-slate-600/20 to-slate-900/20" },
  { name: "Slots", path: "/games/slots", icon: "🎰", desc: "Spin the reels and match symbols for big wins", gradient: "from-pink-600/20 to-pink-900/20" },
  { name: "Plinko", path: "/games/plinko", icon: "⚪", desc: "Drop the ball and watch it bounce to multipliers", gradient: "from-indigo-600/20 to-indigo-900/20" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Ambient gold glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[150px]" style={{ background: 'oklch(0.78 0.12 85 / 0.05)' }} />
        </div>

        {/* Golden dust particles floating upward */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${5 + (i * 4.1) % 92}%`,
                bottom: `${(i * 7) % 40}%`,
                width: i % 3 === 0 ? '3px' : '2px',
                height: i % 3 === 0 ? '3px' : '2px',
                background: i % 2 === 0 ? 'oklch(0.85 0.10 85)' : 'oklch(0.78 0.12 85)',
                boxShadow: '0 0 4px oklch(0.78 0.12 85 / 0.6)',
              }}
              animate={{
                y: [0, -(200 + (i * 30) % 200)],
                x: [0, (i % 2 === 0 ? 1 : -1) * (10 + (i * 7) % 20)],
                opacity: [0, 0.9, 0.9, 0],
                scale: [0.5, 1.2, 0.8, 0],
              }}
              transition={{
                duration: 4 + (i * 0.4) % 4,
                repeat: Infinity,
                delay: (i * 0.35) % 5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <div className="container relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Neon Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="relative">
                {/* Warm radial glow behind logo */}
                <div className="absolute inset-0 rounded-3xl" style={{
                  background: 'radial-gradient(circle, oklch(0.78 0.12 85 / 0.18) 0%, transparent 70%)',
                  filter: 'blur(24px)',
                  transform: 'scale(1.3)',
                }} />
                <img
                  src={neonLogoPath}
                  alt="The Lucky Riverboat Casino & Sportsbook"
                  className="w-64 md:w-80 mx-auto relative rounded-2xl"
                  style={{
                    filter: "drop-shadow(0 0 40px oklch(0.78 0.12 85 / 0.35))",
                    mixBlendMode: "screen",
                  }}
                  data-testid="hero-logo"
                />
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">100% RTP &bull; 0% House Edge</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ fontFamily: "'Cinzel', serif" }}
              data-testid="hero-title"
            >
              The{" "}
              <span className="gold-text-gradient">First Casino</span>{" "}
              With{" "}
              <span className="gold-text-gradient">0% House Edge</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl"
            >
              Welcome aboard The Lucky Riverboat, where every game offers a true 100% Return to Player.
              No hidden edges, no unfair advantages — just pure, transparent gaming.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-muted-foreground mb-8 max-w-xl"
            >
              Deposit with crypto or debit card and start playing ten exclusive house games
              with the fairest odds in online gaming.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 text-lg glow-gold rounded-full uppercase tracking-widest" data-testid="hero-play-btn">
                <Link href="/games/keno">Start Playing</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 px-8 text-lg rounded-full uppercase tracking-widest" data-testid="hero-sportsbook-btn">
                <Link href="/sportsbook">Sportsbook</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why 0% House Edge */}
      <section className="py-24 md:py-32 relative bg-black/20">
        {/* Ambient gold blur */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full blur-[150px]" style={{ background: 'oklch(0.78 0.12 85 / 0.05)' }} />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-3">The Difference</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
              Why <span className="gold-text-gradient">0% House Edge</span> Matters
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Traditional casinos take a percentage of every bet. We don't. Here's how we compare.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional Casino */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 h-full">
                <h3 className="text-xl font-bold text-red-400 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>Traditional Casinos</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>2-15% house edge on every game</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Odds stacked against the player</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Hidden fees and unfair mechanics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Slow withdrawal processing</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Lucky Riverboat */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-primary/5 border border-primary/20 backdrop-blur-sm rounded-xl p-8 h-full glow-gold-sm">
                <h3 className="text-xl font-bold text-primary mb-4" style={{ fontFamily: "'Cinzel', serif" }}>The Lucky Riverboat</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>0% house edge — 100% RTP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Completely fair and transparent odds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>No hidden fees or manipulation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Instant crypto deposits and withdrawals</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet Xebb */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={meetXebbPath}
                alt="Meet Xebb"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
                style={{ boxShadow: "0 0 40px oklch(0.78 0.12 85 / 0.15)" }}
                data-testid="meet-xebb-img"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-3">The Captain</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Cinzel', serif" }} data-testid="meet-xebb-title">
                Meet <span className="gold-text-gradient">Xebb</span>
              </h2>
              <p className="text-muted-foreground mb-4">
                Xebb is the founder and captain of The Lucky Riverboat. A passionate gamer and crypto
                enthusiast, he created this platform with one mission: to build the fairest casino
                in the world.
              </p>
              <p className="text-muted-foreground mb-4">
                Tired of seeing players lose to unfair house edges, Xebb set out to prove that a
                casino could thrive while giving players a truly fair experience. Every game on
                The Lucky Riverboat is designed with 0% house edge.
              </p>
              <p className="text-muted-foreground mb-6">
                Watch Xebb play live and interact with the community on his streaming channel.
              </p>
              <a href="https://kick.com/x3bb3r" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10 rounded-full uppercase tracking-widest"
                  data-testid="xebb-kick-link"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch on Kick.com
                </Button>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-24 md:py-32 relative bg-black/20">
        {/* Ambient gold blur */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px]" style={{ background: 'oklch(0.78 0.12 85 / 0.05)' }} />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-3">Our Promise</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
              Built for <span className="gold-text-gradient">Players</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Shield className="h-8 w-8" />,
                title: "100% RTP",
                desc: "Every game returns 100% to players over time. No hidden edges, no unfair advantages.",
              },
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "0% House Edge",
                desc: "We don't take a cut. Your odds are pure and transparent on every single bet.",
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Instant Crypto",
                desc: "Deposit and withdraw with Bitcoin and Ethereum. Fast, secure, and borderless.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8 text-center h-full group hover:border-primary/30 transition-colors">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid — Emoji style with gradient backgrounds */}
      <section className="py-24 md:py-32">
        {/* Ambient gold blur */}
        <div className="absolute pointer-events-none overflow-hidden w-full">
          <div className="mx-auto w-[500px] h-[300px] rounded-full blur-[150px]" style={{ background: 'oklch(0.78 0.12 85 / 0.04)' }} />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-3">Exclusive Games</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
              Ten <span className="gold-text-gradient">Exclusive Games</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each game is crafted with care and offers a unique experience — all with 0% house edge.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
                    className={`bg-gradient-to-br ${game.gradient} border border-white/10 backdrop-blur-sm rounded-xl p-6 text-center cursor-pointer group h-full hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 game-tile transition-all`}
                    data-testid={`game-card-${game.path.split('/').pop()}`}
                  >
                    <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">
                      {game.icon}
                    </span>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>
                      {game.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{game.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Wager Feed */}
      <section className="py-24 md:py-32 relative bg-black/20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full blur-[120px]" style={{ background: 'oklch(0.78 0.12 85 / 0.04)' }} />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-3 text-center">Happening Now</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ fontFamily: "'Cinzel', serif" }}>
              <span className="gold-text-gradient">Live</span> Action
            </h2>
            <WagerFeedWidget />
          </motion.div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[150px]" style={{ background: 'oklch(0.78 0.12 85 / 0.05)' }} />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-3">All Aboard</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
              Ready to <span className="gold-text-gradient">Set Sail?</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Join The Lucky Riverboat today and experience the fairest casino in the world.
              Deposit with Bitcoin, Ethereum, or debit card and start playing instantly.
            </p>

            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-amber-500">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z" />
                </svg>
                <span className="font-medium">BTC</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                </svg>
                <span className="font-medium">ETH</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span className="font-medium">Debit</span>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 text-lg glow-gold rounded-full uppercase tracking-widest"
              data-testid="cta-deposit-btn"
            >
              <Link href="/wallet">Deposit Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
