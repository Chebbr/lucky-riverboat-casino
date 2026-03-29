import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, AlertTriangle, Clock, Phone, Globe, Heart, Users, CheckCircle } from "lucide-react";

const selfAssessmentQuestions = [
  "Do you spend more money gambling than you intended to?",
  "Do you chase losses by continuing to gamble after losing money?",
  "Have others ever expressed concern about your gambling habits?",
  "Do you gamble to escape stress, anxiety, or personal problems?",
  "Do you feel restless or irritable when you try to cut back on gambling?",
];

export default function ResponsibleGamingPage() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [selfAssessmentDone, setSelfAssessmentDone] = useState(false);
  const [exclusionPeriod, setExclusionPeriod] = useState<string | null>(null);
  const [exclusionConfirmed, setExclusionConfirmed] = useState(false);

  const yesCount = Object.values(answers).filter(Boolean).length;
  const answeredAll = Object.keys(answers).length === selfAssessmentQuestions.length;

  const handleSelfAssessment = () => {
    setSelfAssessmentDone(true);
  };

  const handleExclusion = () => {
    if (!exclusionPeriod) return;
    setExclusionConfirmed(true);
  };

  const getRiskLevel = () => {
    if (yesCount === 0) return { label: "Low Risk", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" };
    if (yesCount <= 2) return { label: "Moderate Risk", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" };
    return { label: "High Risk — Please Seek Help", color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" };
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20 bg-black/20">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[150px]"
            style={{ background: "oklch(0.62 0.15 155 / 0.06)" }}
          />
        </div>
        <div className="container relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/30 mb-6">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Player Protection</span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Cinzel', serif" }}
              data-testid="rg-title"
            >
              Responsible <span className="gold-text-gradient">Gaming</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              We want your experience to be fun and safe. Gambling should be entertainment — never a problem.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-4xl mx-auto py-12 space-y-10">

        {/* Know Your Limits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          data-testid="rg-limits-section"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                Know Your Limits
              </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Setting limits helps you stay in control. We encourage all players to set personal limits for their gaming sessions.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "Deposit Limits", desc: "Cap how much you can deposit in a day, week, or month.", icon: "💰" },
                { title: "Loss Limits", desc: "Set a maximum amount you're willing to lose per session.", icon: "📉" },
                { title: "Session Time Limits", desc: "Limit how long you play in a single sitting.", icon: "⏱️" },
              ].map((limit) => (
                <div key={limit.title} className="bg-black/20 border border-white/10 rounded-xl p-5">
                  <div className="text-2xl mb-3">{limit.icon}</div>
                  <h3 className="font-semibold mb-2">{limit.title}</h3>
                  <p className="text-xs text-muted-foreground">{limit.desc}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10 text-xs"
                    data-testid={`rg-limit-${limit.title.toLowerCase().replace(/ /g, '-')}`}
                  >
                    Set Limit
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Self-Assessment */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          data-testid="rg-assessment-section"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                Self-Assessment
              </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Answer these questions honestly to gauge your relationship with gambling.
            </p>

            {!selfAssessmentDone ? (
              <div className="space-y-4">
                {selfAssessmentQuestions.map((question, i) => (
                  <div key={i} className="flex items-start gap-4 bg-black/20 rounded-xl p-4">
                    <div className="flex gap-3 items-center shrink-0 mt-0.5">
                      <button
                        onClick={() => setAnswers(prev => ({ ...prev, [i]: false }))}
                        className={`w-16 py-1 rounded text-xs font-bold transition-all ${
                          answers[i] === false
                            ? "bg-green-500 text-white"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                        data-testid={`rg-q${i}-no`}
                      >
                        No
                      </button>
                      <button
                        onClick={() => setAnswers(prev => ({ ...prev, [i]: true }))}
                        className={`w-16 py-1 rounded text-xs font-bold transition-all ${
                          answers[i] === true
                            ? "bg-red-500 text-white"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                        data-testid={`rg-q${i}-yes`}
                      >
                        Yes
                      </button>
                    </div>
                    <p className="text-sm text-foreground/80">{question}</p>
                  </div>
                ))}
                <Button
                  className="w-full btn-casino uppercase tracking-wider mt-2"
                  disabled={!answeredAll}
                  onClick={handleSelfAssessment}
                  data-testid="rg-assessment-submit"
                >
                  View Results
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border rounded-xl p-6 text-center ${getRiskLevel().bg}`}
                data-testid="rg-assessment-result"
              >
                <p className="text-sm text-muted-foreground mb-2">Your Result</p>
                <p className={`text-2xl font-bold mb-2 ${getRiskLevel().color}`}>
                  {getRiskLevel().label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {yesCount} of {selfAssessmentQuestions.length} concern indicators
                </p>
                {yesCount >= 3 && (
                  <p className="text-sm mt-4 text-foreground/80">
                    We strongly recommend reaching out to a gambling support service. You can also use our Self-Exclusion tool below.
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-muted-foreground text-xs"
                  onClick={() => { setAnswers({}); setSelfAssessmentDone(false); }}
                  data-testid="rg-assessment-reset"
                >
                  Retake Assessment
                </Button>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Self-Exclusion */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          data-testid="rg-exclusion-section"
        >
          <div className="bg-white/5 border border-red-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                Self-Exclusion
              </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              If you feel you need a break, you can self-exclude for a chosen period. During exclusion, you
              will not be able to log in or place bets.
            </p>

            {exclusionConfirmed ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="font-bold text-green-400">Self-exclusion applied</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have been excluded for {exclusionPeriod}. Take care of yourself.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {["24 Hours", "7 Days", "30 Days", "Permanent"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setExclusionPeriod(period)}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                        exclusionPeriod === period
                          ? "bg-red-500/20 border-red-500/60 text-red-400"
                          : "bg-muted/30 border-white/10 text-muted-foreground hover:border-red-500/30 hover:text-red-400"
                      }`}
                      data-testid={`rg-exclusion-${period.toLowerCase().replace(/ /g, '-')}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider"
                  disabled={!exclusionPeriod}
                  onClick={handleExclusion}
                  data-testid="rg-exclusion-submit"
                >
                  Self-Exclude for {exclusionPeriod ?? "..."}
                </Button>
              </>
            )}
          </div>
        </motion.section>

        {/* Resources */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          data-testid="rg-resources-section"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-400/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
                Help &amp; Resources
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <Phone className="w-5 h-5 text-blue-400" />,
                  title: "National Problem Gambling Helpline",
                  value: "1-800-522-4700",
                  href: "tel:18005224700",
                  desc: "Free, confidential help 24/7.",
                },
                {
                  icon: <Users className="w-5 h-5 text-green-400" />,
                  title: "Gamblers Anonymous",
                  value: "GamblersAnonymous.org",
                  href: "https://www.gamblersanonymous.org",
                  desc: "Fellowship & recovery support.",
                },
                {
                  icon: <Globe className="w-5 h-5 text-purple-400" />,
                  title: "BeGambleAware",
                  value: "BeGambleAware.org",
                  href: "https://www.begambleaware.org",
                  desc: "Tools, advice, and support.",
                },
              ].map((resource) => (
                <a
                  key={resource.title}
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/20 border border-white/10 rounded-xl p-5 hover:border-primary/30 transition-colors group"
                  data-testid={`rg-resource-${resource.title.toLowerCase().replace(/ /g, '-').slice(0, 20)}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {resource.icon}
                    <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                      {resource.value}
                    </span>
                  </div>
                  <p className="text-xs font-bold mb-1">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">{resource.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Our Commitment */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          data-testid="rg-commitment-section"
        >
          <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
                  Our Commitment
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  We are committed to preventing underage gambling and promoting responsible play. Anyone under the
                  age of 18 is strictly prohibited from using this platform. We actively verify age during
                  registration and cooperate with all regulatory requirements to keep gambling safe.
                </p>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  Gambling is meant to be entertainment. If it ever stops being fun, please use our tools above
                  or reach out to one of the resources listed. There is no shame in asking for help.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
