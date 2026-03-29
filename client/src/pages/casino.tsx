import { Link } from "wouter";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, TrendingUp, Star } from "lucide-react";
import plinkoImgPath from "@assets/plinko.png";
import blackjackPath from "@assets/blackjack.png";
import houseOriginalsPath from "@assets/HouseOriginals.png";
import markMcGwirePath from "@assets/MarkMcGwire.png";

const allGames = [
  { name: "Riverboat Keno", slug: "keno", img: houseOriginalsPath, tag: "Numbers", rtp: 100 },
  { name: "Roulette", slug: "roulette", img: blackjackPath, tag: "Classic", rtp: 100 },
  { name: "Hidden Treasure", slug: "mines", img: plinkoImgPath, tag: "Strategy", rtp: 100 },
  { name: "Walk the Plank", slug: "tower", img: houseOriginalsPath, tag: "Climb", rtp: 100 },
  { name: "Beached", slug: "crash", img: plinkoImgPath, tag: "Crash", rtp: 100 },
  { name: "Hitide Lowtide", slug: "hilow", img: blackjackPath, tag: "Cards", rtp: 100 },
  { name: "Helm", slug: "helm", img: houseOriginalsPath, tag: "Spin", rtp: 100 },
  { name: "Blackjack", slug: "blackjack", img: blackjackPath, tag: "Cards", rtp: 100 },
  { name: "Slots", slug: "slots", img: markMcGwirePath, tag: "Classic", rtp: 100 },
  { name: "Plinko", slug: "plinko", img: plinkoImgPath, tag: "Drop", rtp: 100 },
];

function GameCard({ game, idx }: { game: typeof allGames[0]; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      <Link href={`/games/${game.slug}`}>
        <div
          className="glass-panel rounded-xl overflow-hidden game-tile cursor-pointer group"
          data-testid={`casino-game-${game.slug}`}
        >
          <div className="aspect-[4/3] overflow-hidden relative">
            <img src={game.img} alt={game.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/20 px-2 py-0.5 rounded">
                {game.tag}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-display text-sm gold-text mb-1">{game.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-green-400 font-semibold">{game.rtp}% RTP</span>
              <span className="text-[10px] text-muted-foreground">&bull; 0% Edge</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CasinoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Gamepad2 className="w-6 h-6 text-primary" />
          <h1 className="font-display text-2xl gold-text" data-testid="casino-title">Casino Lobby</h1>
        </div>
        <p className="text-muted-foreground text-sm">10 House Original Games &bull; All at 100% RTP</p>
      </motion.div>

      <Tabs defaultValue="all">
        <TabsList className="bg-muted/50 mb-6">
          <TabsTrigger value="all" data-testid="tab-all-games">All Games</TabsTrigger>
          <TabsTrigger value="originals" data-testid="tab-originals">House Originals</TabsTrigger>
          <TabsTrigger value="trending" data-testid="tab-trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allGames.map((g, i) => <GameCard key={g.slug} game={g} idx={i} />)}
          </div>
        </TabsContent>

        <TabsContent value="originals">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allGames.map((g, i) => <GameCard key={g.slug} game={g} idx={i} />)}
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allGames.slice(0, 4).map((g, i) => <GameCard key={g.slug} game={g} idx={i} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
