import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const games = [
  { name: "Riverboat Keno", slug: "keno", icon: "🎱", desc: "Pick your lucky numbers and watch the draw unfold" },
  { name: "Beached", slug: "crash", icon: "🚀", desc: "Ride the wave and cash out before it crashes" },
  { name: "Roulette", slug: "roulette", icon: "🎰", desc: "Place your bets and spin the wheel of fortune" },
  { name: "Helm", slug: "helm", icon: "🎡", desc: "Spin the captain's wheel and claim your treasure" },
  { name: "Walk the Plank", slug: "tower", icon: "🏴‍☠️", desc: "Climb the tower and avoid the traps" },
  { name: "Hidden Treasure", slug: "mines", icon: "💎", desc: "Uncover gems while dodging hidden mines" },
  { name: "Hitide Lowtide", slug: "hilow", icon: "🃏", desc: "Predict if the next card is higher or lower" },
  { name: "Blackjack", slug: "blackjack", icon: "🃏", desc: "Beat the dealer to 21 without going over" },
  { name: "Slots", slug: "slots", icon: "🎰", desc: "Spin the reels and match symbols for big wins" },
  { name: "Plinko", slug: "plinko", icon: "⚪", desc: "Drop the ball and watch it bounce to multipliers" },
];

export default function CasinoPage() {
  return (
    <div className="py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
            House <span className="text-gold">Original</span> Games
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ten exclusive games, all with 0% house edge and 100% RTP. Pick your game and start playing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {games.map((game, i) => (
            <motion.div
              key={game.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link href={`/games/${game.slug}`}>
                <Card className="border-border/50 bg-card hover:border-primary/50 transition-all cursor-pointer group h-full hover:shadow-lg hover:shadow-primary/5 game-tile" data-testid={`casino-game-${game.slug}`}>
                  <CardContent className="p-6 text-center">
                    <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">
                      {game.icon}
                    </span>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{game.desc}</p>
                    <div className="mt-3 text-xs text-primary/70 font-medium">100% RTP</div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
