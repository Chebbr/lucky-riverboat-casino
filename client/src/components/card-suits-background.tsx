import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SUITS = [
  { symbol: "♥", color: "rgb(255, 20, 147)" },
  { symbol: "♦", color: "rgb(255, 69, 0)" },
  { symbol: "♠", color: "rgb(0, 255, 255)" },
  { symbol: "♣", color: "rgb(50, 205, 50)" },
];

export default function CardSuitsBackground() {
  const [suits, setSuits] = useState<any[]>([]);

  useEffect(() => {
    setSuits(Array.from({ length: 40 }, (_, i) => ({
      id: i,
      suit: SUITS[Math.floor(Math.random() * SUITS.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 24 + 16,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 10,
      driftX: Math.random() * 50 - 25,
    })));
  }, []);

  return (
    <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden opacity-30">
      {suits.map((item) => (
        <motion.div
          key={item.id}
          className="absolute font-bold select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            color: item.suit.color,
            textShadow: `0 0 8px ${item.suit.color}`,
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, item.driftX, 0],
            rotate: [0, 360],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "linear",
            delay: item.delay,
          }}
        >
          {item.suit.symbol}
        </motion.div>
      ))}
    </div>
  );
}
