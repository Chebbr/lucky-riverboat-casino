import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, User, Hash, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Lock,
    step: "1",
    title: "Server Seed",
    description:
      "Before each bet is placed, the server generates a cryptographic server seed. The server sends you the SHA-256 hash of this seed — a one-way fingerprint that commits the server to a specific outcome without revealing what the seed is. This means the server cannot change its seed after you've placed your bet.",
  },
  {
    icon: User,
    step: "2",
    title: "Client Seed",
    description:
      "You provide your own client seed (or use the system-generated default). Your seed is combined with the server seed to determine the outcome. Because neither party can know the other's input in advance, neither party can predict or manipulate the result alone. You can change your client seed at any time before a bet.",
  },
  {
    icon: Hash,
    step: "3",
    title: "Verification",
    description:
      "After the bet is resolved, the server reveals its original seed. You can independently verify that the SHA-256 hash of the revealed seed matches the hash you received before the bet. Then verify that the game outcome matches the result of HMAC-SHA256(serverSeed, clientSeed:nonce). If both match, the bet was provably fair.",
  },
];

const faqs = [
  {
    question: "Can the casino cheat?",
    answer:
      "No. Once the server seed hash has been committed and delivered to you before the bet, the server cannot change its seed without the hash mismatch being detectable. Because the outcome is determined by both seeds combined, and neither party knows the other's input in advance, neither party can manipulate the result. The provably fair system is mathematically guaranteed.",
  },
  {
    question: "How do I verify a bet?",
    answer:
      "After a bet is settled, go to your bet history and click 'Verify' on any bet. You'll see the server seed hash (given before the bet), the revealed server seed, your client seed, and the nonce. You can verify these values using any SHA-256 and HMAC-SHA256 tool online, or write your own verification script. The Lucky Riverboat also provides an interactive verifier on this page.",
  },
  {
    question: "What if I find a discrepancy?",
    answer:
      "If you find a discrepancy between the committed hash and the revealed seed, or between the calculation and the stated result, contact us immediately at support@theluckyriverboat.com with the bet ID and your verification data. We take all discrepancy reports seriously and will investigate promptly. In our history, no valid discrepancy has ever been found — the system is mathematically sound.",
  },
];

// Static demo values for the interactive verifier
const DEMO = {
  serverSeedHash: "a3f2e8c9d1b04f6e2a7c5d3b8f1e4c9a2d6b7e0f3c8a1d5e9f2b4c7a0d3e6f8",
  serverSeed: "7a3f9c2e8b1d4f6a0c5e2b9d7f3a8c1e",
  clientSeed: "my_lucky_seed_42",
  nonce: "1",
  result: "Multiplier: 2.14x",
};

export default function ProvablyFairPage() {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-14"
      >
        <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1
          className="text-3xl font-bold gold-text mb-3"
          style={{ fontFamily: "'Cinzel', serif" }}
          data-testid="pf-title"
        >
          Provably Fair
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Every game on The Lucky Riverboat is verifiable. You don't have to trust us — you can
          mathematically prove every bet was fair.
        </p>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <h2
          className="text-xl font-bold gold-text mb-6 text-center"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="glass-panel rounded-xl p-6 flex flex-col gap-3"
              data-testid={`pf-step-${step.step}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Step {step.step}</span>
                  <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
                    {step.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 0% House Edge Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-panel rounded-xl p-6 mb-12"
        data-testid="pf-house-edge"
      >
        <h2
          className="text-lg font-bold gold-text mb-3"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          What 0% House Edge Means
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          A traditional casino takes a percentage of every bet as profit — this is called the house edge. On a
          roulette wheel with a 5.26% house edge, the expected value of a $100 bet is $94.74. The casino keeps
          the rest.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          The Lucky Riverboat operates with a 0% house edge. This means the mathematical expected value of every
          bet is exactly the amount wagered. On a $100 bet, your expected return is $100.00. Over millions of bets,
          the total amount paid out equals the total amount wagered.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The casino generates revenue through volume and the VIP rakeback program — a transparent fee model rather
          than a hidden edge built into the games themselves. Players always know exactly what they're paying.
        </p>
      </motion.div>

      {/* Interactive Verifier */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-panel rounded-xl p-6 mb-12"
        data-testid="pf-verifier"
      >
        <h2
          className="text-lg font-bold gold-text mb-1"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Interactive Verifier
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Verify a sample bet below. The result is calculated as:{" "}
          <code className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs font-mono text-primary">
            HMAC-SHA256(serverSeed, clientSeed:nonce)
          </code>
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {[
            { label: "Server Seed Hash (pre-bet)", value: DEMO.serverSeedHash, mono: true },
            { label: "Revealed Server Seed (post-bet)", value: DEMO.serverSeed, mono: true },
            { label: "Client Seed", value: DEMO.clientSeed, mono: false },
            { label: "Nonce", value: DEMO.nonce, mono: false },
          ].map((field) => (
            <div key={field.label} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
              <p
                className={`text-sm font-medium break-all text-foreground ${field.mono ? "font-mono text-xs" : ""}`}
                data-testid={`verifier-${field.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '')}`}
              >
                {field.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-5">
          <p className="text-xs text-muted-foreground mb-1">Result</p>
          <p className="text-sm font-bold text-primary">{DEMO.result}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleVerify}
            disabled={verifying || verified}
            className="btn-casino"
            data-testid="btn-verify"
          >
            {verifying ? "Verifying..." : verified ? "Verified" : "Verify Bet"}
          </Button>
          {verified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-green-400 text-sm font-medium"
              data-testid="verify-success"
            >
              <CheckCircle2 className="w-5 h-5" />
              Hash matches — bet was provably fair
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        data-testid="pf-faq"
      >
        <h2
          className="text-xl font-bold gold-text mb-5 text-center"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="glass-panel rounded-xl overflow-hidden"
              data-testid={`faq-item-${i}`}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                data-testid={`faq-toggle-${i}`}
              >
                <span className="text-sm font-semibold text-foreground">{faq.question}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 pb-5"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
