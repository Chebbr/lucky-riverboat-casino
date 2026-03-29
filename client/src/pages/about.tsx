import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Anchor, Coins, Trophy, ExternalLink, Mail, MessageSquare, Twitter } from "lucide-react";
import meetXebbPath from "@assets/Meet-Xebb.jpg";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-black/20">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[150px]"
            style={{ background: "oklch(0.78 0.12 85 / 0.08)" }}
          />
        </div>
        <div className="container relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Anchor className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Est. 2024</span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ fontFamily: "'Cinzel', serif" }}
              data-testid="about-title"
            >
              About <span className="gold-text-gradient">The Lucky Riverboat</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The world's first casino with 0% house edge
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-2">
              Why We Exist
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: "'Cinzel', serif" }}>
              Our <span className="gold-text-gradient">Mission</span>
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 text-left relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
                style={{ background: "linear-gradient(90deg, oklch(0.78 0.12 85), transparent)" }}
              />
              <p className="text-lg text-foreground/90 leading-relaxed">
                We built The Lucky Riverboat to prove that a casino can thrive while giving players a truly fair
                experience. Every game runs at{" "}
                <span className="gold-text font-bold">100% RTP</span> — we make money from crypto transaction fees
                and premium services, not from stacking odds against our players.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meet Xebb */}
      <section className="py-16 bg-black/20">
        <div className="container max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-2">
              The Captain
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
              Meet <span className="gold-text-gradient">Xebb</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-10 items-center"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/30 to-transparent blur-sm" />
              <img
                src={meetXebbPath}
                alt="Xebb — Founder of The Lucky Riverboat"
                className="relative rounded-2xl w-full object-cover border border-primary/20"
                style={{ maxHeight: "420px", objectPosition: "top" }}
                data-testid="about-xebb-image"
              />
            </div>
            <div className="space-y-6">
              <p className="text-lg text-foreground/90 leading-relaxed">
                Xebb is the founder and captain of The Lucky Riverboat. A passionate gamer and crypto enthusiast,
                he created this platform with one mission: to build the fairest casino in the world.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Stream live sessions, interact with the community, and witness provably fair gaming in action.
                Xebb streams regularly on Kick and is always engaging with the community.
              </p>
              <Button
                asChild
                className="btn-casino uppercase tracking-wider px-6"
                data-testid="about-kick-btn"
              >
                <a href="https://kick.com/x3bb3r" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Live on Kick
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-2">
              Simple &amp; Fast
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
              How It <span className="gold-text-gradient">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector lines on desktop */}
            <div className="hidden md:flex absolute top-1/3 left-[33%] right-[33%] items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-primary/20" />
            </div>

            {[
              { icon: <Coins className="w-8 h-8 text-primary" />, step: "01", title: "Deposit Crypto", desc: "Send BTC, ETH, or USDT to your secure wallet. Transactions are instant and transparent on-chain." },
              { icon: <Trophy className="w-8 h-8 text-primary" />, step: "02", title: "Pick a Game", desc: "Choose from 10+ provably fair games — all running at 100% RTP with no hidden house advantage." },
              { icon: <ArrowRight className="w-8 h-8 text-primary" />, step: "03", title: "Keep Your Winnings", desc: "Every win is paid out at true odds. What you win is exactly what the math says you should win." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center h-full hover:border-primary/30 transition-colors group relative">
                  <div className="absolute top-4 right-4 text-[10px] font-bold text-primary/40 tracking-widest">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Provably Fair */}
      <section className="py-16 bg-black/20">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-10">
              <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-2">
                Transparency First
              </p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                Provably <span className="gold-text-gradient">Fair</span>
              </h2>
            </div>

            <div className="bg-white/5 border border-primary/20 rounded-2xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                    How 0% House Edge Works
                  </h3>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    Every game result is determined by a cryptographic seed that neither the player nor the house
                    can predict or manipulate. The server seed is hashed before you bet, and revealed after — so
                    you can verify every outcome independently.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    When we say 100% RTP, we mean it: the expected value of every bet equals exactly what you
                    wagered. The only "edge" we operate on is the tiny network fee embedded in crypto transactions.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">
                  Primary Deposit Address
                </p>
                <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3 font-mono text-xs text-primary/80 break-all">
                  <code data-testid="about-deposit-address">0xCd48AebB3B83A65a8f5187Fe8471905D270c3236</code>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-muted-foreground mb-2">
              Get In Touch
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-10" style={{ fontFamily: "'Cinzel', serif" }}>
              Contact <span className="gold-text-gradient">Us</span>
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: <Mail className="w-5 h-5 text-primary" />,
                  label: "Email",
                  value: "support@theluckyriverboat.com",
                  href: "mailto:support@theluckyriverboat.com",
                },
                {
                  icon: <ExternalLink className="w-5 h-5 text-primary" />,
                  label: "Kick",
                  value: "kick.com/x3bb3r",
                  href: "https://kick.com/x3bb3r",
                },
                {
                  icon: <MessageSquare className="w-5 h-5 text-primary" />,
                  label: "Discord",
                  value: "Join Server",
                  href: "https://discord.gg/theluckyriverboat",
                },
                {
                  icon: <Twitter className="w-5 h-5 text-primary" />,
                  label: "Twitter / X",
                  value: "@luckyriverboat",
                  href: "https://twitter.com/luckyriverboat",
                },
              ].map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  data-testid={`about-contact-${contact.label.toLowerCase()}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    {contact.icon}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{contact.label}</p>
                  <p className="text-sm font-medium text-foreground/90">{contact.value}</p>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
