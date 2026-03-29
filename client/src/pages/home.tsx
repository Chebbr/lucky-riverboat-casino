import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Zap, TrendingUp, Gamepad2, Star, ExternalLink } from "lucide-react";
import logoPath from "@assets/Poker-Chip-Logo.png";
import heroPath from "@assets/Metaverse-Hover.jpg";
import zeroEdgePath from "@assets/ZeroHouseEdge.png";
import meetXebbPath from "@assets/Meet-Xebb.jpg";
import houseOriginalsPath from "@assets/HouseOriginals.png";
import plinkoPath from "@assets/plinko.png";
import blackjackPath from "@assets/blackjack.png";

import markMcGwirePath from "@assets/MarkMcGwire.png";

const gameCards = [
  { name: "Riverboat Keno", slug: "keno", img: houseOriginalsPath },
  { name: "Roulette", slug: "roulette", img: blackjackPath },
  { name: "Hidden Treasure", slug: "mines", img: plinkoPath },
  { name: "Walk the Plank", slug: "tower", img: houseOriginalsPath },
  { name: "Beached", slug: "crash", img: plinkoPath },
  { name: "Hitide Lowtide", slug: "hilow", img: blackjackPath },
  { name: "Helm", slug: "helm", img: houseOriginalsPath },
  { name: "Blackjack", slug: "blackjack", img: blackjackPath },
  { name: "Slots", slug: "slots", img: markMcGwirePath },
  { name: "Plinko", slug: "plinko", img: plinkoPath },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroPath})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-3xl"
        >
          <img src={logoPath} alt="Lucky Riverboat" className="w-28 h-28 mx-auto mb-6" data-testid="hero-logo" />
          <h1 className="font-display text-4xl md:text-5xl gold-text neon-text-gold mb-4" data-testid="hero-title">
            The Lucky Riverboat
          </h1>
          <h2 className="font-display text-xl md:text-2xl text-foreground mb-6">
            Casino & Sportsbook
          </h2>
          <div className="inline-flex items-center gap-2 glass-panel rounded-full px-6 py-2 mb-8">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold gold-text">100% RTP</span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-sm font-bold gold-text">0% House Edge</span>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/casino">
              <Button className="btn-casino text-base px-8 py-3" data-testid="hero-play-btn">
                <Gamepad2 className="w-5 h-5 mr-2" /> Play Now
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" className="text-base px-8 py-3 border-primary/30 text-primary hover:bg-primary/10" data-testid="hero-register-btn">
                Create Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-2xl gold-text mb-2">Why Lucky Riverboat?</h2>
            <p className="text-muted-foreground">The fairest casino on the blockchain</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "0% House Edge", desc: "Every game runs at 100% RTP. We make money from crypto fees, not your losses." },
              { icon: TrendingUp, title: "100% RTP", desc: "Return to player is maximized. Your expected value is always fair." },
              { icon: Zap, title: "Instant Crypto", desc: "Deposit and withdraw in BTC, ETH, or USDT with instant settlement." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-xl p-6 text-center game-tile"
              >
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-background" />
                </div>
                <h3 className="font-display text-lg gold-text mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 0% House Edge Info */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl gold-text mb-4" data-testid="zero-edge-title">
              Why 0% House Edge Matters
            </h2>
            <p className="text-muted-foreground mb-4">
              Traditional casinos take 2-15% of every bet as profit. At Lucky Riverboat, we've eliminated
              the house edge entirely. Every game runs at 100% RTP, meaning over time, players keep
              what they win.
            </p>
            <p className="text-muted-foreground">
              Our revenue comes from crypto transaction fees and premium services — not from stacking
              odds against our players.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img src={zeroEdgePath} alt="Zero House Edge Infographic" className="rounded-xl gold-glow w-full" data-testid="zero-edge-img" />
          </motion.div>
        </div>
      </section>

      {/* Game Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl gold-text mb-2">House Original Games</h2>
            <p className="text-muted-foreground">10 exclusive games, all provably fair</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gameCards.map((game, i) => (
              <motion.div
                key={game.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/games/${game.slug}`}>
                  <div className="glass-panel rounded-xl overflow-hidden game-tile cursor-pointer" data-testid={`game-card-${game.slug}`}>
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={game.img} alt={game.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-display text-sm gold-text">{game.name}</h3>
                      <p className="text-xs text-muted-foreground">100% RTP</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Xebb */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img src={meetXebbPath} alt="Meet Xebb" className="rounded-xl gold-glow w-full max-w-sm mx-auto" data-testid="meet-xebb-img" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl gold-text mb-4" data-testid="meet-xebb-title">Meet Xebb</h2>
            <p className="text-muted-foreground mb-4">
              Founder and captain of The Lucky Riverboat. Follow the journey live on Kick.
            </p>
            <a href="https://kick.com/x3bb3r" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" data-testid="xebb-kick-link">
                <ExternalLink className="w-4 h-4 mr-2" /> Watch on Kick.com
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl gold-text neon-text-gold mb-4">Ready to Play?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of players enjoying the fairest casino experience in crypto.
          </p>
          <Link href="/auth">
            <Button className="btn-casino text-lg px-10 py-4" data-testid="cta-register-btn">
              Get Started — Free $1,000 Demo
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
