import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowLeft, Gamepad2, Eye, Info } from "lucide-react";
import neonLogoPath from "@assets/Neon-Riverboat-Logo.png";
import metaversePath from "@assets/Metaverse-Hover.jpg";
import landscapePath from "@assets/Metaverse-Hover.jpg";
import CasinoWorld from "@/components/casino-world";

export default function MetaversePage() {
  const [, setLocation] = useLocation();
  const [isWorldOpen, setIsWorldOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string } | null>(null);

  const handlePlayGame = (gameId: string) => {
    setIsWorldOpen(false);
    setLocation(`/games/${gameId}`);
  };

  if (isWorldOpen) {
    return (
      <CasinoWorld
        onClose={() => setIsWorldOpen(false)}
        theme={selectedRoom?.id}
        roomName={selectedRoom?.name}
        onPlayGame={handlePlayGame}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[150px]" style={{ background: 'oklch(0.78 0.12 85 / 0.06)' }} />
        </div>

        <div className="container relative text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">3D Casino Experience</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
              The <span className="text-gold text-shadow-gold">Metaverse</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              Step into a fully realized 3D world. Walk the casino floor, explore the riverboat deck,
              visit the bar, and play games — all from your browser.
            </p>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Use WASD or arrow keys to move. Click to look around. Press ESC to release cursor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 text-lg glow-gold"
                onClick={() => setIsWorldOpen(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Enter Casino Floor
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 px-8 text-lg"
                onClick={() => {
                  setSelectedRoom({ id: "03", name: "Gold VIP Suite" });
                  setIsWorldOpen(true);
                }}
              >
                <Eye className="w-5 h-5 mr-2" />
                Visit VIP Cabin
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Preview Image */}
      <section className="py-8">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-border/50 cursor-pointer group"
            onClick={() => setIsWorldOpen(true)}
          >
            <img
              src={metaversePath}
              alt="The Lucky Riverboat Casino Metaverse"
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-primary fill-current" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <span className="text-xs uppercase tracking-widest text-primary font-bold">Casino Floor</span>
              <h3 className="text-3xl font-bold mt-1" style={{ fontFamily: "'Cinzel', serif" }}>
                Explore the Riverboat
              </h3>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ fontFamily: "'Cinzel', serif" }}>
            What <span className="text-gold">Awaits</span> Inside
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Casino Floor",
                desc: "Walk freely through the main casino with poker tables, roulette wheels, slot machines, and blackjack tables.",
                icon: Gamepad2,
              },
              {
                title: "Riverboat Deck",
                desc: "Step outside onto the deck and enjoy the view of the river under the night sky with lanterns and ambient lighting.",
                icon: Eye,
              },
              {
                title: "The Bar",
                desc: "Visit the bar area with vintage shelving, ambient lighting, and a place to relax between games.",
                icon: Play,
              },
              {
                title: "Stage & Entertainment",
                desc: "A grand stage with curtains and spotlight — home to live events and entertainment.",
                icon: Play,
              },
              {
                title: "VIP Cabins",
                desc: "Exclusive private suites with custom furniture, paintings, and personalized luxury touches.",
                icon: Eye,
              },
              {
                title: "Interactive Games",
                desc: "Click on any game table to launch the actual casino game — play directly from the 3D world.",
                icon: Gamepad2,
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="py-16 border-t border-border/50">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Cinzel', serif" }}>
            <span className="text-gold">Controls</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "W / ↑", action: "Move Forward" },
              { key: "S / ↓", action: "Move Backward" },
              { key: "A / ←", action: "Move Left" },
              { key: "D / →", action: "Move Right" },
              { key: "Mouse", action: "Look Around" },
              { key: "Click", action: "Lock Cursor" },
              { key: "ESC", action: "Release Cursor" },
              { key: "Click Game", action: "Play Game" },
            ].map((ctrl, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="text-primary font-mono font-bold text-sm mb-1">{ctrl.key}</div>
                <div className="text-xs text-muted-foreground">{ctrl.action}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
