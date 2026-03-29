import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search, ShieldCheck } from "lucide-react";

const games = [
  { name: "Riverboat Keno", slug: "keno", icon: "🎱", desc: "Pick your lucky numbers and watch the draw unfold", players: Math.floor(Math.random() * 451 + 50) },
  { name: "Beached", slug: "crash", icon: "🚀", desc: "Ride the wave and cash out before it crashes", players: Math.floor(Math.random() * 451 + 50) },
  { name: "Roulette", slug: "roulette", icon: "🎰", desc: "Place your bets and spin the wheel of fortune", players: Math.floor(Math.random() * 451 + 50) },
  { name: "Helm", slug: "helm", icon: "🎡", desc: "Spin the captain's wheel and claim your treasure", players: Math.floor(Math.random() * 451 + 50) },
  { name: "Walk the Plank", slug: "tower", icon: "🏴‍☠️", desc: "Climb the tower and avoid the traps", players: Math.floor(Math.random() * 451 + 50) },
  { name: "Hidden Treasure", slug: "mines", icon: "💎", desc: "Uncover gems while dodging hidden mines", players: Math.floor(Math.random() * 451 + 50) },
  { name: "Hitide Lowtide", slug: "hilow", icon: "🃏", desc: "Predict if the next card is higher or lower", players: Math.floor(Math.random() * 451 + 50) },
  { name: "Blackjack", slug: "blackjack", icon: "🃏", desc: "Beat the dealer to 21 without going over", players: Math.floor(Math.random() * 451 + 50) },
  { name: "Slots", slug: "slots", icon: "🎰", desc: "Spin the reels and match symbols for big wins", players: Math.floor(Math.random() * 451 + 50) },
  { name: "Plinko", slug: "plinko", icon: "⚪", desc: "Drop the ball and watch it bounce to multipliers", players: Math.floor(Math.random() * 451 + 50) },
];

export default function CasinoPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    games.filter(g =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.desc.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  return (
    <div className="py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
            House <span className="text-gold">Original</span> Games
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ten exclusive games, all with 0% house edge and 100% RTP. Pick your game and start playing.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="max-w-md mx-auto mb-10"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search games..."
              className="pl-9 bg-muted/30 border-border/50 focus:border-primary/50"
              data-testid="casino-search"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {filtered.map((game, i) => (
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
                    <p className="text-sm text-muted-foreground mb-3">{game.desc}</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">100% RTP</span>
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primary/60 bg-primary/10 px-2 py-0.5 rounded">
                        <ShieldCheck className="w-2.5 h-2.5" /> Provably Fair
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[11px] text-muted-foreground">{game.players} playing</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-muted-foreground"
          >
            <p className="text-lg">No games found matching "{search}"</p>
            <p className="text-sm mt-2">Try a different search term</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
