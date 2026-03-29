import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Diamond,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Twitter,
  Globe,
  Copy,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Vote,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import riverboatLogo from "@assets/Neon-Riverboat-Logo.png";
import pokerChipLogo from "@assets/Poker-Chip-Logo.png";
import metaverseImg from "@assets/Metaverse-Hover.jpg";

// ─── Types ───────────────────────────────────────────────────────────────────

type VIPLevel = "bronze" | "silver" | "gold" | "platinum";

interface TierInfo {
  label: string;
  price: number;
  priceLabel: string;
  gradient: string;
  border: string;
  rooms: string;
  description: string;
  color: string;
  supply: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TIERS: Record<VIPLevel, TierInfo> = {
  bronze: {
    label: "Bronze VIP",
    price: 0.05,
    priceLabel: "0.05 ETH",
    gradient: "bg-gradient-to-br from-orange-900/40 to-orange-950/60",
    border: "border-orange-600/30",
    rooms: "Cabins #001–111",
    description: "Entry to the Riverboat. Your first key to the most exclusive metaverse casino in existence.",
    color: "text-orange-400",
    supply: 111,
  },
  silver: {
    label: "Silver VIP",
    price: 0.08,
    priceLabel: "0.08 ETH",
    gradient: "bg-gradient-to-br from-slate-800/40 to-slate-900/60",
    border: "border-slate-400/30",
    rooms: "Cabins #112–222",
    description: "Upper-deck quarters with elevated privileges and a larger share of the monthly treasury.",
    color: "text-slate-300",
    supply: 111,
  },
  gold: {
    label: "Gold VIP",
    price: 0.10,
    priceLabel: "0.10 ETH",
    gradient: "bg-gradient-to-br from-yellow-900/40 to-amber-950/60",
    border: "border-yellow-500/30",
    rooms: "Cabins #223–333",
    description: "Prime suite access with gold-tier governance weight and priority reservation at all tables.",
    color: "text-yellow-400",
    supply: 111,
  },
  platinum: {
    label: "Platinum VIP",
    price: 0.17,
    priceLabel: "0.17 ETH",
    gradient: "bg-gradient-to-br from-cyan-900/40 to-cyan-950/60",
    border: "border-cyan-400/30",
    rooms: "Cabins #334–444",
    description: "Captain's quarters. Maximum treasury weight, first access to all features, and a seat at the captain's table.",
    color: "text-cyan-400",
    supply: 111,
  },
};

const ROADMAP = [
  {
    phase: "Phase I",
    title: "The Maiden Voyage",
    items: ["Genesis Mint of 444 Cabins", "Riverboat Casino Beta Launch", "Community Treasury Activation", "Holder Verification System"],
    img: riverboatLogo,
    imgAlt: "Lucky Riverboat Logo",
    status: "active",
  },
  {
    phase: "Phase II",
    title: "High Stakes",
    items: ["$RIVER Token Airdrop", "House Original Games Expansion", "Live Dealer Integration", "Weekly Holder Tournaments"],
    img: pokerChipLogo,
    imgAlt: "Poker Chip Logo",
    status: "upcoming",
  },
  {
    phase: "Phase III",
    title: "The Metaverse",
    items: ["3D Cabin Customization Live", "VR Casino Experience", "Social Hubs & Voice Chat", "Third-Party Game Integration"],
    img: metaverseImg,
    imgAlt: "Metaverse Preview",
    status: "upcoming",
  },
  {
    phase: "Phase IV",
    title: "The Empire",
    items: ["Physical Casino Partnerships", "Riverboat DAO Governance", 'Annual "Captain\'s Ball" in Vegas', "Global Marketing Campaign"],
    img: null,
    imgAlt: null,
    status: "upcoming",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is The Lucky Riverboat?",
    a: "The Lucky Riverboat is a collection of 444 unique NFT cabin keys. Each key grants the holder ownership of a customizable 3D suite within the Riverboat Casino metaverse, along with exclusive VIP privileges.",
  },
  {
    q: "How do I access my cabin?",
    a: "Once minted, your NFT acts as a master key. By connecting your wallet to the Lucky Riverboat dApp, you will be able to enter your 3D suite, customize it, and invite guests.",
  },
  {
    q: "How does the revenue share work?",
    a: "40% of all casino profits are directed into the Riverboat Treasury. 25% of this treasury is distributed monthly to NFT holders via a smart contract claim dashboard.",
  },
  {
    q: "When is the reveal?",
    a: "The cabin keys will reveal their specific room rarity and attributes 48 hours after the public mint concludes.",
  },
];

const DEPOSIT_ADDRESS = "0xCd48AebB3B83A65a8f5187Fe8471905D270c3236";

// ─── Particle Canvas ──────────────────────────────────────────────────────────

function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; alphaSpeed: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.2,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random(),
        alphaSpeed: Math.random() * 0.005 + 0.002,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed;
        if (p.alpha > 1 || p.alpha < 0) p.alphaSpeed *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234, 179, 8, ${p.alpha * 0.6})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/20 transition-colors"
        onClick={() => setOpen(!open)}
        data-testid={`faq-toggle-${index}`}
      >
        <span className="font-medium text-foreground pr-4" style={{ fontFamily: "'Cinzel', serif" }}>
          {q}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gold shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NFTPage() {
  const [vipLevel, setVipLevel] = useState<VIPLevel>("bronze");
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const tier = TIERS[vipLevel];
  const totalPrice = (tier.price * quantity).toFixed(3);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(234,179,8,0.06),transparent)]" />
        <GoldParticles />

        <div className="relative z-10 container text-center max-w-4xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/5 mb-6">
              <Diamond className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs uppercase tracking-widest text-gold font-medium">444 Unique NFT Cabins</span>
            </div>

            <h1
              className="text-5xl sm:text-7xl font-bold text-gold-text-gradient mb-6 leading-tight"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              <span className="gold-text-gradient">All Aboard</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              The Lucky Riverboat is a collection of{" "}
              <span className="text-foreground font-semibold">444 unique NFT cabins</span>. More than digital art, your
              NFT is a fully immersive, customizable suite granting unprecedented VIP access to the metaverse's premier
              vintage casino.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                className="btn-casino glow-gold px-8 py-6 text-base rounded-full uppercase tracking-widest font-bold"
                onClick={() => scrollTo("mint-section")}
                data-testid="btn-mint-now-hero"
              >
                Mint Now
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 text-base rounded-full border-border/60 text-muted-foreground hover:text-foreground hover:border-gold/40 uppercase tracking-widest"
                onClick={() => scrollTo("collection-section")}
                data-testid="btn-view-collection"
              >
                View Collection
              </Button>
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            >
              <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Mint Section ─────────────────────────────────────────────────── */}
      <section id="mint-section" className="py-24 relative">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left */}
              <div className="p-8 lg:p-10 border-b md:border-b-0 md:border-r border-border">
                {/* Live indicator */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                  <span className="text-xs uppercase tracking-widest text-green-400 font-semibold">Mint is Live</span>
                </div>

                <h2
                  className="text-3xl font-bold text-gold mb-3"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Acquire Your Key
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                  Select your cabin tier below. Each NFT is a unique master key granting permanent access to your
                  metaverse suite and all associated holder privileges.
                </p>

                {/* Stats */}
                <div className="space-y-4">
                  {/* VIP Level */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">VIP Level</span>
                    <Select value={vipLevel} onValueChange={(v) => setVipLevel(v as VIPLevel)}>
                      <SelectTrigger
                        className="w-40 h-8 text-sm border-border bg-muted/30"
                        data-testid="select-vip-level"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price per NFT */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Price</span>
                    <span className="text-sm font-semibold text-gold" data-testid="mint-price-per">
                      {tier.priceLabel}
                    </span>
                  </div>

                  {/* Total minted */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Minted</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" data-testid="mint-progress-text">
                        127 / 444
                      </span>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full gold-gradient rounded-full"
                          style={{ width: `${(127 / 444) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Max per wallet */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Max per Wallet</span>
                    <span className="text-sm font-semibold">2</span>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Quantity</p>

                  {/* Quantity selector */}
                  <div className="flex items-center gap-4 mb-8">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10 border-border"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      data-testid="btn-qty-minus"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-3xl font-bold w-8 text-center" data-testid="mint-quantity">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10 border-border"
                      onClick={() => setQuantity(Math.min(2, quantity + 1))}
                      disabled={quantity >= 2}
                      data-testid="btn-qty-plus"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Total price */}
                  <div className="glass-panel rounded-xl p-4 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Price</span>
                      <span className="text-2xl font-bold text-gold" data-testid="mint-total-price">
                        {totalPrice} ETH
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quantity} × {tier.priceLabel} · {tier.label}
                    </p>
                  </div>
                </div>

                <Button
                  className="btn-casino glow-gold w-full py-6 rounded-full text-sm uppercase tracking-widest font-bold"
                  data-testid="btn-mint-key"
                >
                  Mint Key
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Connect your wallet to complete the transaction
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Collection Section ────────────────────────────────────────────── */}
      <section id="collection-section" className="py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-4xl font-bold text-gold mb-4"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              The Collection
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each NFT is a master key, granting ownership of a unique architectural marvel.
            </p>
            <Button
              variant="outline"
              className="mt-6 border-border/60 text-muted-foreground hover:text-foreground hover:border-gold/40 gap-2"
              data-testid="btn-opensea"
            >
              <ExternalLink className="h-4 w-4" />
              View All on OpenSea
            </Button>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(TIERS) as [VIPLevel, TierInfo][]).map(([key, t], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`${t.gradient} border ${t.border} rounded-2xl p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform cursor-pointer`}
                data-testid={`card-tier-${key}`}
              >
                <div className="flex items-center gap-2">
                  <Diamond className={`h-5 w-5 ${t.color}`} />
                  <h3 className={`font-bold ${t.color}`} style={{ fontFamily: "'Cinzel', serif" }}>
                    {t.label}
                  </h3>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{t.rooms}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className={`text-sm font-bold ${t.color}`}>{t.priceLabel}</span>
                  <span className="text-xs text-muted-foreground">Supply: {t.supply}</span>
                </div>
                <Button
                  variant="outline"
                  className={`border ${t.border} text-xs py-1.5 rounded-lg ${t.color} hover:bg-white/5`}
                  data-testid={`btn-view-details-${key}`}
                >
                  View Details
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits Section ──────────────────────────────────────────────── */}
      <section id="benefits-section" className="py-24 bg-card/30">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-4xl font-bold text-gold"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Holder Benefits
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Revenue Share",
                desc: "40% of casino profits flow to the treasury. Holders claim monthly.",
                color: "text-green-400",
                bg: "bg-green-500/10",
              },
              {
                icon: Diamond,
                title: "VIP Access",
                desc: "Exclusive high-stakes tables, priority support, and premium features.",
                color: "text-gold",
                bg: "bg-yellow-500/10",
              },
              {
                icon: Vote,
                title: "Governance",
                desc: "Vote on casino development, new games, and treasury allocations.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: Building2,
                title: "Metaverse Suite",
                desc: "Own and customize your 3D cabin in the Riverboat metaverse.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4"
                data-testid={`card-benefit-${i}`}
              >
                <div className={`w-10 h-10 rounded-xl ${b.bg} flex items-center justify-center`}>
                  <b.icon className={`h-5 w-5 ${b.color}`} />
                </div>
                <h3 className="font-bold text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
                  {b.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Treasury Section ──────────────────────────────────────────────── */}
      <section id="treasury-section" className="py-24">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2
                className="text-4xl font-bold text-gold mb-4"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                The Treasury
              </h2>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 lg:p-10">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Total Value</p>
                  <p className="text-3xl font-bold text-gold" style={{ fontFamily: "'Cinzel', serif" }}>
                    $2.4M
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Simulated</p>
                </div>
                <div className="text-center border-x border-border">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Monthly Distribution</p>
                  <p className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
                    25%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Of treasury</p>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Holder Share</p>
                  <p className="text-3xl font-bold text-green-400" style={{ fontFamily: "'Cinzel', serif" }}>
                    ~$1,351
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Per NFT / month</p>
                </div>
              </div>

              {/* Treasury flow bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span className="uppercase tracking-widest">Casino Profits</span>
                  <span className="uppercase tracking-widest">Holder Claims</span>
                </div>
                <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[40%] gold-gradient rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-background">40% → Treasury</span>
                  </div>
                  <div className="absolute top-0 left-[40%] h-full w-[25%] bg-green-500/70 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">25% Out</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>60% operational</span>
                  <span>40% to treasury · 25% distributed monthly</span>
                </div>
              </div>

              <Button
                className="btn-casino glow-gold w-full py-5 rounded-full uppercase tracking-widest font-bold"
                data-testid="btn-connect-wallet-treasury"
              >
                Connect Wallet to Claim
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Roadmap Section ───────────────────────────────────────────────── */}
      <section id="roadmap-section" className="py-24 bg-card/30">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl font-bold text-gold"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              The Voyage Ahead
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROADMAP.map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`bg-card border rounded-2xl overflow-hidden flex flex-col ${
                  phase.status === "active" ? "border-yellow-500/40" : "border-border"
                }`}
                data-testid={`card-phase-${i + 1}`}
              >
                {/* Phase image or placeholder */}
                {phase.img ? (
                  <div className="h-36 overflow-hidden bg-muted/20">
                    <img
                      src={phase.img}
                      alt={phase.imgAlt || ""}
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                ) : (
                  <div className="h-36 bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-purple-400/50" />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs uppercase tracking-widest font-bold ${
                        phase.status === "active" ? "text-gold" : "text-muted-foreground"
                      }`}
                    >
                      {phase.phase}
                    </span>
                    {phase.status === "active" && (
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
                      </span>
                    )}
                  </div>
                  <h3
                    className="font-bold text-foreground mb-4"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {phase.title}
                  </h3>
                  <ul className="space-y-2 mt-auto">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                            phase.status === "active" ? "text-gold" : "text-muted-foreground/40"
                          }`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ───────────────────────────────────────────────────── */}
      <section id="faq-section" className="py-24">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-4xl font-bold text-gold"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Common Inquiries
            </h2>
          </motion.div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────────────── */}
      <section id="footer-cta" className="py-24 bg-card/30 border-t border-border/50">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-4xl font-bold text-gold mb-4"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Join the Voyage
            </h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              Follow our journey and be the first to hear about mint announcements, holder events, and treasury updates.
            </p>

            {/* Social links */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-border/60 hover:border-gold/40 hover:text-gold"
                data-testid="btn-social-twitter"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              {/* Discord icon via SVG */}
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-border/60 hover:border-gold/40 hover:text-gold"
                data-testid="btn-social-discord"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.043.03.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-border/60 hover:border-gold/40 hover:text-gold"
                data-testid="btn-social-website"
              >
                <Globe className="h-5 w-5" />
              </Button>
            </div>

            {/* Deposit address */}
            <div className="glass-panel rounded-xl p-5 max-w-xl mx-auto">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Contract Address</p>
              <div className="flex items-center gap-3">
                <code className="text-sm text-foreground font-mono flex-1 truncate" data-testid="text-deposit-address">
                  {DEPOSIT_ADDRESS}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 hover:text-gold"
                  onClick={copyAddress}
                  data-testid="btn-copy-address"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
