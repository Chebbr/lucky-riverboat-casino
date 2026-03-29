import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const sections = [
  {
    number: 1,
    title: "Information We Collect",
    content: `When you create an account and use The Lucky Riverboat, we collect the following categories of information: (a) Account Information — your chosen username and any profile details you provide; (b) Wallet Addresses — the cryptocurrency wallet addresses you use for deposits and withdrawals; (c) Game Activity — a complete history of your bets, wagers, payouts, game results, and timestamps; (d) Technical Information — your IP address, browser type, and device identifiers for security and fraud prevention purposes. We do not collect government-issued ID, email addresses, phone numbers, or any other personally identifiable information unless specifically required for compliance purposes.`,
  },
  {
    number: 2,
    title: "How We Use Information",
    content: `We use the information we collect for the following purposes: (a) Account Management — to create and maintain your account, process transactions, and provide customer support; (b) Game History — to display your bet history, calculate statistics, and provide transparency into your gaming activity; (c) VIP Tracking — to calculate your cumulative wagering volume, determine your VIP tier, and compute rakeback rewards; (d) Security — to detect and prevent fraud, multi-accounting, bot activity, and other prohibited behaviors; (e) Platform Improvement — to analyze usage patterns and improve our games and services. We do not use your information for advertising or targeted marketing.`,
  },
  {
    number: 3,
    title: "Data Storage",
    content: `All data stored by The Lucky Riverboat is encrypted at rest using industry-standard AES-256 encryption. We follow a minimal data collection principle — we collect only the information necessary to operate the Platform. Your data is never sold, rented, or shared with third parties for commercial purposes. Data is retained for as long as your account is active and for a reasonable period thereafter as required for legal and operational purposes. Wallet addresses and transaction records may be retained for longer periods for regulatory compliance. Our servers are located in secure, access-controlled facilities.`,
  },
  {
    number: 4,
    title: "Cookies & Local Storage",
    content: `The Lucky Riverboat does not use cookies, localStorage, sessionStorage, or any similar browser-based storage mechanisms. This is an intentional technical design decision: our platform uses server-side sessions and in-memory state management exclusively. This means your session data is never persisted in your browser between sessions, providing an additional layer of privacy. You will need to re-authenticate each time you visit. This architecture also means that clearing your browser data will have no impact on your account.`,
  },
  {
    number: 5,
    title: "Third-Party Services",
    content: `The Lucky Riverboat integrates with the ESPN API to provide live sports data for our Sportsbook feature. When you use the Sportsbook, sports data is fetched from ESPN's public API. No personal information is shared with ESPN or any other third-party data provider. We do not use third-party analytics services (e.g., Google Analytics), advertising networks, or tracking pixels. Our provably fair system operates entirely within our own infrastructure. If we add third-party integrations in the future, this policy will be updated accordingly.`,
  },
  {
    number: 6,
    title: "Your Rights",
    content: `You have the following rights regarding your personal information: (a) Access — you may request a copy of all data we hold about you; (b) Deletion — you may request that your account and all associated data be permanently deleted; upon deletion, your game history, wallet associations, and account information will be removed from our active systems; (c) Export — you may request an export of your game history in a portable format (JSON or CSV); (d) Correction — if you believe any information we hold is inaccurate, you may request a correction. To exercise any of these rights, contact us at support@theluckyriverboat.com. We will process all requests within 30 days.`,
  },
  {
    number: 7,
    title: "Security",
    content: `We implement industry-standard security measures to protect your information from unauthorized access, disclosure, alteration, or destruction. These measures include: end-to-end TLS/SSL encryption for all data in transit; AES-256 encryption for data at rest; server-side authentication with hashed and salted passwords; rate limiting and anomaly detection to prevent brute force attacks; and regular security audits. Despite these measures, no system is completely secure. If you discover a security vulnerability, please report it responsibly to support@theluckyriverboat.com.`,
  },
  {
    number: 8,
    title: "Contact",
    content: `For any privacy-related questions, data requests, or concerns, please contact us at support@theluckyriverboat.com. Please include "Privacy Request" in the subject line. We are committed to addressing all privacy inquiries within 30 days. For urgent security matters, please mark your subject line "URGENT — SECURITY."`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1
          className="text-3xl font-bold gold-text mb-2"
          style={{ fontFamily: "'Cinzel', serif" }}
          data-testid="privacy-title"
        >
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm">Last Updated: March 29, 2026</p>
      </motion.div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={section.number}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-panel rounded-xl p-6"
            data-testid={`privacy-section-${section.number}`}
          >
            <h2
              className="text-base font-bold text-foreground mb-3 flex items-start gap-2"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              <span className="text-primary shrink-0 tabular-nums">
                {section.number}.
              </span>
              {section.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-xs text-muted-foreground"
      >
        &copy; {new Date().getFullYear()} The Lucky Riverboat Casino &amp; Sportsbook. All rights reserved.
      </motion.div>
    </div>
  );
}
