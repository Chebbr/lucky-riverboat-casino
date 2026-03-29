import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, ExternalLink } from "lucide-react";
import WagerFeedWidget from "@/components/wager-feed-widget";
import neonLogoPath from "@assets/Neon-Riverboat-Logo.png";
import meetXebbPath from "@assets/Meet-Xebb.jpg";

const games = [
  { name: "Riverboat Keno", path: "/games/keno", icon: "🎱", desc: "Pick your lucky numbers and watch the draw unfold" },
  { name: "Beached", path: "/games/crash", icon: "🚀", desc: "Ride the wave and cash out before it crashes" },
  { name: "Roulette", path: "/games/roulette", icon: "🎰", desc: "Place your bets and spin the wheel of fortune" },
  { name: "Helm", path: "/games/helm", icon: "🎡", desc: "Spin the captain's wheel and claim your treasure" },
  { name: "Walk the Plank", path: "/games/tower", icon: "🏴‍☠️", desc: "Climb the tower and avoid the traps" },
  { name: "Hidden Treasure", path: "/games/mines", icon: "💎", desc: "Uncover gems while dodging hidden mines" },
  { name: "Hitide Lowtide", path: "/games/hilow", icon: "🃏", desc: "Predict if the next card is higher or lower" },
  { name: "Blackjack", path: "/games/blackjack", icon: "🃏", desc: "Beat the dealer to 21 without going over" },
  { name: "Slots", path: "/games/slots", icon: "🎰", desc: "Spin the reels and match symbols for big wins" },
  { name: "Plinko", path: "/games/plinko", icon: "⚪", desc: "Drop the ball and watch it bounce to multipliers" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        {/* Particle effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        <div className="container relative py-16 md:py-24">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Neon Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <img
                src={neonLogoPath}
                alt="The Lucky Riverboat Casino & Sportsbook"
                className="w-64 md:w-80 mx-auto"
                style={{ filter: "drop-shadow(0 0 30px oklch(0.78 0.12 85 / 0.3))" }}
                data-testid="hero-logo"
              />
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
              <span className="text-gold text-shadow-gold">First Casino</span>{" "}
              With{" "}
              <span className="text-gold text-shadow-gold">0% House Edge</span>
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
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 text-lg glow-gold" data-testid="hero-play-btn">
                <Link href="/games/keno">Start Playing</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 px-8 text-lg" data-testid="hero-sportsbook-btn">
                <Link href="/sportsbook">Sportsbook</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why 0% House Edge */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-secondary/20 to-transparent">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
              Why <span className="text-gold">0% House Edge</span> Matters
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
              <Card className="border-red-500/30 bg-red-500/5 h-full">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-red-400 mb-4">Traditional Casinos</h3>
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Lucky Riverboat */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-primary/30 bg-primary/5 h-full glow-gold-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-primary mb-4">The Lucky Riverboat</h3>
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
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet Xebb */}
      <section className="py-16 md:py-24">
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
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Cinzel', serif" }} data-testid="meet-xebb-title">
                Meet <span className="text-gold">Xebb</span>
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
                  className="border-primary/50 text-primary hover:bg-primary/10"
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
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-secondary/20 to-transparent">
        <div className="container">
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
                <Card className="border-primary/20 bg-card hover:bg-card/80 transition-colors h-full group">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid — Emoji style */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
              Ten <span className="text-gold">Exclusive Games</span>
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
                  <Card className="border-border/50 bg-card hover:border-primary/50 transition-all cursor-pointer group h-full hover:shadow-lg hover:shadow-primary/5 game-tile" data-testid={`game-card-${game.path.split('/').pop()}`}>
                    <CardContent className="p-6 text-center">
                      <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">
                        {game.icon}
                      </span>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{game.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Wager Feed */}
      <section className="py-16 md:py-24 bg-card/30 border-y border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ fontFamily: "'Cinzel', serif" }}>
              <span className="text-gold">Live</span> Action
            </h2>
            <WagerFeedWidget />
          </motion.div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
              Ready to <span className="text-gold">Set Sail?</span>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 text-lg glow-gold"
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
