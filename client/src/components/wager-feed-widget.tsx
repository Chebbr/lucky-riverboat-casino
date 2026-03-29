import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Wager {
  userName: string;
  gameType: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  result: "win" | "loss";
  timestamp: Date;
}

const GAME_EMOJIS: Record<string, string> = {
  keno: "🎱",
  crash: "🚀",
  roulette: "🎰",
  helm: "🎡",
  tower: "🏴‍☠️",
  mines: "💎",
  hilow: "🃏",
  blackjack: "🃏",
  slots: "🎰",
  plinko: "⚪",
};

const GAME_NAMES: Record<string, string> = {
  keno: "Riverboat Keno",
  crash: "Beached",
  roulette: "Roulette",
  helm: "Helm",
  tower: "Walk the Plank",
  mines: "Hidden Treasure",
  hilow: "Hitide Lowtide",
  blackjack: "Blackjack",
  slots: "Slots",
  plinko: "Plinko",
};

const FAKE_NAMES = [
  "CryptoKing", "NeonSailor", "GoldRush88", "LuckyDice", "WhaleBet",
  "DarkHorse", "AceHigh", "RiverRat", "CoinFlip", "BigStack",
  "MoonShot", "HighRoller", "NightOwl", "IronHand", "WildCard",
  "SilverFox", "BluChip", "MaxBet", "ZenPlayer", "DeepSea",
];

function generateWager(): Wager {
  const gameKeys = Object.keys(GAME_EMOJIS);
  const gameType = gameKeys[Math.floor(Math.random() * gameKeys.length)];
  const userName = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
  const betAmount = parseFloat((Math.random() * 500 + 5).toFixed(2));
  const isWin = Math.random() > 0.45;
  const multiplier = isWin ? parseFloat((Math.random() * 10 + 0.5).toFixed(2)) : 0;
  const payout = isWin ? parseFloat((betAmount * multiplier).toFixed(2)) : 0;

  return {
    userName,
    gameType,
    betAmount,
    multiplier,
    payout,
    result: isWin ? "win" : "loss",
    timestamp: new Date(),
  };
}

export default function WagerFeedWidget() {
  const [wagers, setWagers] = useState<Wager[]>(() => {
    // Seed with some initial wagers
    return Array.from({ length: 8 }, () => generateWager());
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setWagers((prev) => [generateWager(), ...prev.slice(0, 19)]);
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm" data-testid="wager-feed">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-semibold text-gold text-sm">Live Wagers</h3>
        </div>
      </div>
      <ScrollArea className="h-72">
        <div className="p-3 space-y-2">
          {wagers.map((wager, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg text-xs border transition-all ${
                wager.result === "win"
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{GAME_EMOJIS[wager.gameType] || "🎮"}</span>
                  <div>
                    <p className="font-semibold text-foreground">{wager.userName}</p>
                    <p className="text-foreground/60">{GAME_NAMES[wager.gameType] || wager.gameType}</p>
                  </div>
                </div>
                {wager.result === "win" ? (
                  <TrendingUp size={16} className="text-green-500" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Bet: ${wager.betAmount.toFixed(2)}</span>
                <span className="font-semibold">
                  {wager.result === "win" ? (
                    <span className="text-green-500">+${wager.payout.toFixed(2)}</span>
                  ) : (
                    <span className="text-red-500">-${wager.betAmount.toFixed(2)}</span>
                  )}
                </span>
              </div>
              {wager.multiplier > 0 && (
                <p className="text-foreground/50 text-xs mt-1">
                  Multiplier: {wager.multiplier.toFixed(2)}x
                </p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
