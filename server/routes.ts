import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { storage, db } from "./storage";
import {
  users, wallets, transactions, games, bets, bonusCodes,
  sportsEvents, sportsBets,
  insertUserSchema
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { eq } from "drizzle-orm";

const SessionStore = MemoryStore(session);

// VIP tier thresholds
const VIP_TIERS = [
  { tier: "diamond", threshold: 1000000, cashback: 0.15, depositBonus: 1.0 },
  { tier: "platinum", threshold: 250000, cashback: 0.08, depositBonus: 0.5 },
  { tier: "gold", threshold: 50000, cashback: 0.04, depositBonus: 0.2 },
  { tier: "silver", threshold: 10000, cashback: 0.02, depositBonus: 0.1 },
  { tier: "bronze", threshold: 1000, cashback: 0.01, depositBonus: 0.05 },
  { tier: "none", threshold: 0, cashback: 0, depositBonus: 0 },
];

function getVipTier(totalWagered: number) {
  return VIP_TIERS.find(t => totalWagered >= t.threshold) || VIP_TIERS[VIP_TIERS.length - 1];
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
  next();
}

function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
  if ((req.user as any).role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
}

// Generate crypto-style address
function genAddress(currency: string) {
  const chars = "0123456789abcdef";
  let addr = currency === "BTC" ? "bc1q" : currency === "ETH" ? "0x" : "T";
  for (let i = 0; i < 32; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return addr;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Session setup
  app.use(
    session({
      secret: "lucky-riverboat-secret-key-2026",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: { maxAge: 24 * 60 * 60 * 1000, sameSite: "lax" },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });

  // ===== SEED DATA =====
  await seedData();

  // ===== AUTH ROUTES =====
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ message: "Username and password required" });
      
      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(400).json({ message: "Username already taken" });

      const user = await storage.createUser({ username, password, createdAt: new Date().toISOString() });

      // Create wallets
      for (const currency of ["BTC", "ETH", "USDT"]) {
        await storage.createWallet({
          userId: user.id,
          currency,
          balance: 0,
          address: genAddress(currency),
        });
      }

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        const { password: _, ...safeUser } = user;
        return res.json(safeUser);
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        const { password: _, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      return res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const { password: _, ...safeUser } = req.user as any;
    return res.json(safeUser);
  });

  // ===== WALLET ROUTES =====
  app.get("/api/wallet/balances", requireAuth, async (req: Request, res: Response) => {
    const userWallets = await storage.getWalletsByUser((req.user as any).id);
    return res.json(userWallets);
  });

  app.post("/api/wallet/deposit", requireAuth, async (req: Request, res: Response) => {
    const { currency, amount } = req.body;
    if (!currency || !amount || amount <= 0) return res.status(400).json({ message: "Invalid deposit" });

    const wallet = await storage.getWallet((req.user as any).id, currency);
    if (!wallet) return res.status(400).json({ message: "Wallet not found" });

    await storage.updateWalletBalance(wallet.id, wallet.balance + amount);
    await storage.createTransaction({
      userId: (req.user as any).id,
      type: "deposit",
      amount,
      currency,
      status: "completed",
      txHash: "sim_" + Math.random().toString(36).slice(2, 10),
      createdAt: new Date().toISOString(),
    });

    return res.json({ message: "Deposit successful", newBalance: wallet.balance + amount });
  });

  app.post("/api/wallet/withdraw", requireAuth, async (req: Request, res: Response) => {
    const { currency, amount, address } = req.body;
    if (!currency || !amount || amount <= 0) return res.status(400).json({ message: "Invalid withdrawal" });

    const wallet = await storage.getWallet((req.user as any).id, currency);
    if (!wallet || wallet.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    await storage.updateWalletBalance(wallet.id, wallet.balance - amount);
    await storage.createTransaction({
      userId: (req.user as any).id,
      type: "withdraw",
      amount,
      currency,
      status: "pending",
      txHash: null,
      createdAt: new Date().toISOString(),
    });

    return res.json({ message: "Withdrawal submitted", newBalance: wallet.balance - amount });
  });

  app.get("/api/wallet/transactions", requireAuth, async (req: Request, res: Response) => {
    const txs = await storage.getTransactionsByUser((req.user as any).id);
    return res.json(txs);
  });

  // ===== GAME ROUTES =====
  app.post("/api/games/play", requireAuth, async (req: Request, res: Response) => {
    try {
      const { gameSlug, betAmount, currency, gameData } = req.body;
      const userId = (req.user as any).id;

      if (!gameSlug || !betAmount || betAmount <= 0 || !currency) {
        return res.status(400).json({ message: "Invalid bet" });
      }

      const wallet = await storage.getWallet(userId, currency);
      if (!wallet || wallet.balance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct bet
      await storage.updateWalletBalance(wallet.id, wallet.balance - betAmount);

      let result: any;
      switch (gameSlug) {
        case "keno": result = playKeno(betAmount, gameData); break;
        case "roulette": result = playRoulette(betAmount, gameData); break;
        case "mines": result = playMines(betAmount, gameData); break;
        case "tower": result = playTower(betAmount, gameData); break;
        case "crash": result = playCrash(betAmount, gameData); break;
        case "hilow": result = playHiLow(betAmount, gameData); break;
        case "helm": result = playHelm(betAmount, gameData); break;
        case "blackjack": result = playBlackjack(betAmount, gameData); break;
        case "slots": result = playSlots(betAmount, gameData); break;
        case "plinko": result = playPlinko(betAmount, gameData); break;
        default: return res.status(400).json({ message: "Unknown game" });
      }

      // Credit winnings
      if (result.payout > 0) {
        const freshWallet = await storage.getWallet(userId, currency);
        await storage.updateWalletBalance(freshWallet!.id, freshWallet!.balance + result.payout);
      }

      // Record bet
      await storage.createBet({
        userId,
        gameSlug,
        amount: betAmount,
        multiplier: result.multiplier || 0,
        payout: result.payout,
        currency,
        createdAt: new Date().toISOString(),
      });

      // Update wagered & VIP
      await storage.updateUserWagered(userId, betAmount);
      const updatedUser = await storage.getUser(userId);
      if (updatedUser) {
        const vip = getVipTier(updatedUser.totalWagered);
        if (vip.tier !== updatedUser.vipTier) {
          await storage.updateUserVipTier(userId, vip.tier);
        }
      }

      // Get updated balance
      const finalWallet = await storage.getWallet(userId, currency);

      return res.json({
        ...result,
        newBalance: finalWallet?.balance || 0,
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  // Active game sessions for mines/tower/crash
  const activeSessions: Map<string, any> = new Map();

  app.post("/api/games/start", requireAuth, async (req: Request, res: Response) => {
    try {
      const { gameSlug, betAmount, currency, gameData } = req.body;
      const userId = (req.user as any).id;

      if (!betAmount || betAmount <= 0 || !currency) {
        return res.status(400).json({ message: "Invalid bet" });
      }

      const wallet = await storage.getWallet(userId, currency);
      if (!wallet || wallet.balance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      await storage.updateWalletBalance(wallet.id, wallet.balance - betAmount);

      const sessionKey = `${userId}-${gameSlug}`;
      let sessionData: any = {};

      if (gameSlug === "mines") {
        const mineCount = gameData?.mineCount || 3;
        const mines = generateMinePositions(mineCount, 25);
        sessionData = { mines, revealed: [], mineCount, betAmount, currency, multiplier: 1 };
      } else if (gameSlug === "tower") {
        const towers: number[] = [];
        for (let i = 0; i < 8; i++) towers.push(Math.floor(Math.random() * 3));
        sessionData = { safeTiles: towers, currentLevel: 0, betAmount, currency, multiplier: 1 };
      } else if (gameSlug === "crash") {
        const crashPoint = generateCrashPoint();
        sessionData = { crashPoint, betAmount, currency, currentMultiplier: 1.0 };
      }

      activeSessions.set(sessionKey, sessionData);
      const freshWallet = await storage.getWallet(userId, currency);

      return res.json({
        message: "Game started",
        newBalance: freshWallet?.balance || 0,
        ...(gameSlug === "crash" ? { crashPoint: undefined } : {}),
      });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/games/reveal", requireAuth, async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const { gameSlug, tileIndex, level, tileChoice } = req.body;
    const sessionKey = `${userId}-${gameSlug}`;
    const session = activeSessions.get(sessionKey);

    if (!session) return res.status(400).json({ message: "No active game" });

    if (gameSlug === "mines") {
      if (session.mines.includes(tileIndex)) {
        activeSessions.delete(sessionKey);
        await storage.createBet({
          userId, gameSlug, amount: session.betAmount, multiplier: 0,
          payout: 0, currency: session.currency, createdAt: new Date().toISOString(),
        });
        await storage.updateUserWagered(userId, session.betAmount);
        return res.json({ hit: true, mines: session.mines, payout: 0, multiplier: 0 });
      }
      session.revealed.push(tileIndex);
      const safeCount = 25 - session.mineCount;
      session.multiplier = calculateMinesMultiplier(session.revealed.length, session.mineCount);
      return res.json({ hit: false, multiplier: session.multiplier, revealed: session.revealed });
    }

    if (gameSlug === "tower") {
      if (session.safeTiles[session.currentLevel] !== tileChoice) {
        activeSessions.delete(sessionKey);
        await storage.createBet({
          userId, gameSlug, amount: session.betAmount, multiplier: 0,
          payout: 0, currency: session.currency, createdAt: new Date().toISOString(),
        });
        await storage.updateUserWagered(userId, session.betAmount);
        return res.json({
          safe: false, safeTile: session.safeTiles[session.currentLevel],
          allSafeTiles: session.safeTiles, payout: 0, multiplier: 0,
        });
      }
      session.currentLevel++;
      session.multiplier = Math.pow(1.5, session.currentLevel);
      const completed = session.currentLevel >= 8;
      if (completed) {
        const payout = session.betAmount * session.multiplier;
        const wallet = await storage.getWallet(userId, session.currency);
        await storage.updateWalletBalance(wallet!.id, wallet!.balance + payout);
        activeSessions.delete(sessionKey);
        await storage.createBet({
          userId, gameSlug, amount: session.betAmount, multiplier: session.multiplier,
          payout, currency: session.currency, createdAt: new Date().toISOString(),
        });
        await storage.updateUserWagered(userId, session.betAmount);
        const freshWallet = await storage.getWallet(userId, session.currency);
        return res.json({
          safe: true, multiplier: session.multiplier, completed: true,
          payout, newBalance: freshWallet?.balance || 0,
        });
      }
      return res.json({ safe: true, multiplier: session.multiplier, currentLevel: session.currentLevel, completed: false });
    }

    return res.status(400).json({ message: "Invalid game for reveal" });
  });

  app.post("/api/games/cashout", requireAuth, async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const { gameSlug, currentMultiplier } = req.body;
    const sessionKey = `${userId}-${gameSlug}`;
    const session = activeSessions.get(sessionKey);

    if (!session) return res.status(400).json({ message: "No active game session" });

    let multiplier = 1;
    if (gameSlug === "mines") {
      multiplier = session.multiplier;
    } else if (gameSlug === "tower") {
      multiplier = session.multiplier;
    } else if (gameSlug === "crash") {
      multiplier = currentMultiplier || 1;
      if (multiplier >= session.crashPoint) {
        activeSessions.delete(sessionKey);
        await storage.createBet({
          userId, gameSlug, amount: session.betAmount, multiplier: 0,
          payout: 0, currency: session.currency, createdAt: new Date().toISOString(),
        });
        return res.json({ crashed: true, crashPoint: session.crashPoint, payout: 0 });
      }
    }

    const payout = session.betAmount * multiplier;
    const wallet = await storage.getWallet(userId, session.currency);
    await storage.updateWalletBalance(wallet!.id, wallet!.balance + payout);
    activeSessions.delete(sessionKey);

    await storage.createBet({
      userId, gameSlug, amount: session.betAmount, multiplier,
      payout, currency: session.currency, createdAt: new Date().toISOString(),
    });
    await storage.updateUserWagered(userId, session.betAmount);

    const freshWallet = await storage.getWallet(userId, session.currency);
    return res.json({ payout, multiplier, newBalance: freshWallet?.balance || 0 });
  });

  app.get("/api/games/session", requireAuth, (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const { gameSlug } = req.query;
    const sessionKey = `${userId}-${gameSlug}`;
    const session = activeSessions.get(sessionKey);
    if (!session) return res.json({ active: false });
    return res.json({
      active: true,
      multiplier: session.multiplier || session.currentMultiplier || 1,
      currentLevel: session.currentLevel,
      revealed: session.revealed,
      ...(session.crashPoint ? {} : {}),
    });
  });

  app.get("/api/games/history", requireAuth, async (req: Request, res: Response) => {
    const betHistory = await storage.getBetsByUser((req.user as any).id);
    return res.json(betHistory);
  });

  app.get("/api/games/list", async (_req: Request, res: Response) => {
    const gameList = await storage.getGames();
    return res.json(gameList);
  });

  // ===== SPORTS ROUTES =====
  app.get("/api/sports/events", async (_req: Request, res: Response) => {
    const events = await storage.getSportsEvents();
    return res.json(events);
  });

  app.post("/api/sports/bet", requireAuth, async (req: Request, res: Response) => {
    const { eventId, prediction, amount, currency } = req.body;
    const userId = (req.user as any).id;

    if (!eventId || !prediction || !amount || amount <= 0 || !currency) {
      return res.status(400).json({ message: "Invalid bet" });
    }

    const event = await storage.getSportsEvent(eventId);
    if (!event) return res.status(400).json({ message: "Event not found" });

    const wallet = await storage.getWallet(userId, currency);
    if (!wallet || wallet.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    const odds = prediction === "home" ? event.homeOdds : prediction === "away" ? event.awayOdds : (event.drawOdds || 0);

    await storage.updateWalletBalance(wallet.id, wallet.balance - amount);
    const bet = await storage.createSportsBet({
      userId, eventId, prediction, amount, odds, payout: 0,
      status: "pending", currency, createdAt: new Date().toISOString(),
    });

    await storage.createTransaction({
      userId, type: "bet", amount, currency, status: "completed",
      txHash: null, createdAt: new Date().toISOString(),
    });

    const freshWallet = await storage.getWallet(userId, currency);
    return res.json({ bet, newBalance: freshWallet?.balance || 0 });
  });

  app.get("/api/sports/bets", requireAuth, async (req: Request, res: Response) => {
    const sportBets = await storage.getSportsBetsByUser((req.user as any).id);
    return res.json(sportBets);
  });

  // ===== ADMIN ROUTES =====
  app.get("/api/admin/stats", requireAdmin, async (_req: Request, res: Response) => {
    const allUsers = await storage.getAllUsers();
    const allBets = await storage.getAllBets();
    const totalWagered = allBets.reduce((sum, b) => sum + b.amount, 0);
    const totalPayouts = allBets.reduce((sum, b) => sum + b.payout, 0);
    return res.json({
      totalWagered,
      houseProfit: totalWagered - totalPayouts,
      userCount: allUsers.length,
      activeSessions: activeSessions.size,
    });
  });

  app.get("/api/admin/users", requireAdmin, async (_req: Request, res: Response) => {
    const allUsers = await storage.getAllUsers();
    return res.json(allUsers.map(u => ({ ...u, password: undefined })));
  });

  app.get("/api/admin/games", requireAdmin, async (_req: Request, res: Response) => {
    const gameList = await storage.getGames();
    return res.json(gameList);
  });

  app.post("/api/admin/games/:id/rtp", requireAdmin, async (req: Request, res: Response) => {
    const { rtp } = req.body;
    const id = parseInt(req.params.id);
    await storage.updateGameRtp(id, rtp, 100 - rtp);
    return res.json({ message: "RTP updated" });
  });

  app.get("/api/admin/withdrawals", requireAdmin, async (_req: Request, res: Response) => {
    const pending = await storage.getPendingWithdrawals();
    return res.json(pending);
  });

  app.post("/api/admin/withdrawals/:id/approve", requireAdmin, async (req: Request, res: Response) => {
    await storage.updateTransactionStatus(parseInt(req.params.id), "completed");
    return res.json({ message: "Approved" });
  });

  app.post("/api/admin/withdrawals/:id/reject", requireAdmin, async (req: Request, res: Response) => {
    await storage.updateTransactionStatus(parseInt(req.params.id), "rejected");
    return res.json({ message: "Rejected" });
  });

  app.get("/api/admin/bonuses", requireAdmin, async (_req: Request, res: Response) => {
    const codes = await storage.getBonusCodes();
    return res.json(codes);
  });

  app.post("/api/admin/bonuses", requireAdmin, async (req: Request, res: Response) => {
    const { code, type, value, maxUses, expiresAt } = req.body;
    const bonus = await storage.createBonusCode({ code, type, value, maxUses: maxUses || 100, expiresAt });
    return res.json(bonus);
  });

  // ===== VIP ROUTES =====
  app.get("/api/vip/status", requireAuth, async (req: Request, res: Response) => {
    const user = await storage.getUser((req.user as any).id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const vip = getVipTier(user.totalWagered);
    const nextTierIdx = VIP_TIERS.findIndex(t => t.tier === vip.tier) - 1;
    const nextTier = nextTierIdx >= 0 ? VIP_TIERS[nextTierIdx] : null;
    return res.json({
      currentTier: vip.tier,
      totalWagered: user.totalWagered,
      cashbackRate: vip.cashback,
      depositBonus: vip.depositBonus,
      nextTier: nextTier ? { tier: nextTier.tier, threshold: nextTier.threshold, remaining: nextTier.threshold - user.totalWagered } : null,
    });
  });

  app.get("/api/vip/benefits", (_req: Request, res: Response) => {
    return res.json(VIP_TIERS.filter(t => t.tier !== "none"));
  });

  return httpServer;
}

// ===== GAME LOGIC =====

function playKeno(betAmount: number, gameData: any) {
  const selectedNumbers: number[] = gameData?.selectedNumbers || [];
  if (selectedNumbers.length < 1 || selectedNumbers.length > 10) {
    return { payout: 0, multiplier: 0, drawnNumbers: [], matches: 0, error: "Pick 1-10 numbers" };
  }

  const drawn: number[] = [];
  while (drawn.length < 20) {
    const n = Math.floor(Math.random() * 80) + 1;
    if (!drawn.includes(n)) drawn.push(n);
  }

  const matches = selectedNumbers.filter(n => drawn.includes(n)).length;
  const payTable: Record<number, number[]> = {
    1: [0, 3.5],
    2: [0, 1, 6],
    3: [0, 0, 2, 16],
    4: [0, 0, 1, 5, 30],
    5: [0, 0, 0, 2, 12, 60],
    6: [0, 0, 0, 1, 5, 20, 100],
    7: [0, 0, 0, 0, 3, 10, 40, 200],
    8: [0, 0, 0, 0, 2, 5, 20, 80, 400],
    9: [0, 0, 0, 0, 1, 3, 10, 40, 150, 600],
    10: [0, 0, 0, 0, 0, 2, 5, 20, 60, 250, 1000],
  };

  const table = payTable[selectedNumbers.length] || payTable[1];
  const multiplier = table[matches] || 0;
  const payout = betAmount * multiplier;

  return { payout, multiplier, drawnNumbers: drawn, matches, selectedNumbers };
}

function playRoulette(betAmount: number, gameData: any) {
  const rouletteNumber = Math.floor(Math.random() * 37); // 0-36
  const rouletteRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const isRed = rouletteRed.includes(rouletteNumber);
  const isBlack = rouletteNumber > 0 && !isRed;
  const isOdd = rouletteNumber > 0 && rouletteNumber % 2 === 1;
  const isEven = rouletteNumber > 0 && rouletteNumber % 2 === 0;

  const betsArr = gameData?.bets || [];
  let totalPayout = 0;

  for (const bet of betsArr) {
    const amt = bet.amount || betAmount;
    switch (bet.type) {
      case "number":
        if (parseInt(bet.value) === rouletteNumber) totalPayout += amt * 36;
        break;
      case "red":
        if (isRed) totalPayout += amt * 2;
        break;
      case "black":
        if (isBlack) totalPayout += amt * 2;
        break;
      case "odd":
        if (isOdd) totalPayout += amt * 2;
        break;
      case "even":
        if (isEven) totalPayout += amt * 2;
        break;
      case "1-18":
        if (rouletteNumber >= 1 && rouletteNumber <= 18) totalPayout += amt * 2;
        break;
      case "19-36":
        if (rouletteNumber >= 19 && rouletteNumber <= 36) totalPayout += amt * 2;
        break;
      case "1st12":
        if (rouletteNumber >= 1 && rouletteNumber <= 12) totalPayout += amt * 3;
        break;
      case "2nd12":
        if (rouletteNumber >= 13 && rouletteNumber <= 24) totalPayout += amt * 3;
        break;
      case "3rd12":
        if (rouletteNumber >= 25 && rouletteNumber <= 36) totalPayout += amt * 3;
        break;
    }
  }

  return {
    payout: totalPayout,
    multiplier: totalPayout / betAmount,
    number: rouletteNumber,
    color: rouletteNumber === 0 ? "green" : isRed ? "red" : "black",
  };
}

function generateMinePositions(count: number, total: number): number[] {
  const mines: number[] = [];
  while (mines.length < count) {
    const pos = Math.floor(Math.random() * total);
    if (!mines.includes(pos)) mines.push(pos);
  }
  return mines;
}

function calculateMinesMultiplier(revealed: number, mineCount: number): number {
  const total = 25;
  let mult = 1;
  for (let i = 0; i < revealed; i++) {
    mult *= (total - mineCount - i) > 0 ? total / (total - mineCount - i) : 1;
  }
  return Math.round(mult * 100) / 100;
}

function playMines(betAmount: number, gameData: any) {
  // For instant play (not session-based), generate full result
  const mineCount = gameData?.mineCount || 3;
  const mines = generateMinePositions(mineCount, 25);
  return { payout: 0, multiplier: 0, mines, mineCount, sessionBased: true };
}

function playTower(betAmount: number, gameData: any) {
  return { payout: 0, multiplier: 0, sessionBased: true };
}

function generateCrashPoint(): number {
  const r = Math.random();
  if (r < 0.01) return 1.0; // 1% instant crash
  return Math.max(1.0, Math.round((1 / (1 - r)) * 100) / 100);
}

function playCrash(betAmount: number, gameData: any) {
  const crashPoint = generateCrashPoint();
  const autoCashout = gameData?.autoCashout;

  if (autoCashout && autoCashout <= crashPoint) {
    return { payout: betAmount * autoCashout, multiplier: autoCashout, crashPoint, cashedOut: true };
  }

  return { payout: 0, multiplier: 0, crashPoint, cashedOut: false, sessionBased: true };
}

function playHiLow(betAmount: number, gameData: any) {
  const cards = Array.from({ length: 13 }, (_, i) => i + 1); // 1-13
  const currentCard = Math.floor(Math.random() * 13) + 1;
  const nextCard = Math.floor(Math.random() * 13) + 1;
  const prediction = gameData?.prediction; // 'high' or 'low'

  const correct =
    (prediction === "high" && nextCard >= currentCard) ||
    (prediction === "low" && nextCard <= currentCard);

  // Probability-based payout
  const prob = prediction === "high" ? (14 - currentCard) / 13 : currentCard / 13;
  const multiplier = correct ? Math.round((1 / Math.max(prob, 0.08)) * 100) / 100 : 0;
  const payout = correct ? betAmount * multiplier : 0;

  return { payout, multiplier, currentCard, nextCard, prediction, correct };
}

function playBlackjack(betAmount: number, gameData: any) {
  // Client-side game — the result is computed on client and sent to backend for recording
  // Server determines payout based on what the client reports
  // Since this is 0% house edge demo, we trust client game results
  const action = gameData?.type;
  // Simple approach: server computes the multiplier from client-reported data
  // In production, all card logic would be server-side
  const cards = gameData?.cards || [];
  const dealerCards = gameData?.dealerCards || [];
  
  // Calculate hand values server-side for verification
  const cardValues: Record<string, number> = {
    A: 11, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
    "8": 8, "9": 9, "10": 10, J: 10, Q: 10, K: 10,
  };
  
  const handValue = (hand: any[]) => {
    let val = 0, aces = 0;
    for (const c of hand) {
      val += cardValues[c.value] || 0;
      if (c.value === "A") aces++;
    }
    while (val > 21 && aces > 0) { val -= 10; aces--; }
    return val;
  };
  
  const pv = handValue(cards);
  const dv = handValue(dealerCards);
  
  let multiplier = 0;
  if (pv === 21 && cards.length === 2) multiplier = 2.5; // Blackjack
  else if (pv > 21) multiplier = 0;
  else if (dv > 21) multiplier = 2;
  else if (pv > dv) multiplier = 2;
  else if (pv === dv) multiplier = 1;
  else multiplier = 0;
  
  return { payout: betAmount * multiplier, multiplier, playerValue: pv, dealerValue: dv };
}

function playSlots(betAmount: number, _gameData: any) {
  const symbols = ["🍒", "🍊", "🍋", "🔔", "⭐", "💎", "7️⃣"];
  const payoutTable: Record<string, number> = {
    "🍒🍒🍒": 2, "🍊🍊🍊": 3, "🍋🍋🍋": 4, "🔔🔔🔔": 5,
    "⭐⭐⭐": 10, "💎💎💎": 25, "7️⃣7️⃣7️⃣": 100,
  };
  
  const finalReels = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  
  const combo = finalReels.join("");
  const multiplier = payoutTable[combo] || 0;
  const payout = betAmount * multiplier;
  
  return { payout, multiplier, finalReels, combo };
}

function playPlinko(betAmount: number, _gameData: any) {
  const rows = 8;
  const multipliers = [0.5, 1, 1.5, 2, 3, 2, 1.5, 1, 0.5];
  
  // Generate ball path
  let position = 4; // Start center
  const path: number[] = [position];
  
  for (let i = 0; i < rows; i++) {
    position += Math.random() > 0.5 ? 1 : -1;
    position = Math.max(0, Math.min(8, position));
    path.push(position);
  }
  
  const finalPosition = path[rows];
  const multiplier = multipliers[finalPosition];
  const payout = betAmount * multiplier;
  
  return { payout, multiplier, path, finalPosition };
}

function playHelm(betAmount: number, gameData: any) {
  const segments = [
    { value: 1, weight: 30, label: "1x" },
    { value: 2, weight: 25, label: "2x" },
    { value: 3, weight: 20, label: "3x" },
    { value: 5, weight: 12, label: "5x" },
    { value: 10, weight: 8, label: "10x" },
    { value: 20, weight: 4, label: "20x" },
    { value: 50, weight: 1, label: "50x" },
  ];

  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
  let rand = Math.random() * totalWeight;
  let selected = segments[0];

  for (const seg of segments) {
    rand -= seg.weight;
    if (rand <= 0) { selected = seg; break; }
  }

  return {
    payout: betAmount * selected.value,
    multiplier: selected.value,
    segment: selected.label,
    segmentIndex: segments.indexOf(selected),
    allSegments: segments.map(s => s.label),
  };
}

// ===== SEED DATA =====
async function seedData() {
  // Check if already seeded
  const existingAdmin = await storage.getUserByUsername("admin");
  if (existingAdmin) return;

  // Create admin
  const admin = await storage.createUser({ username: "admin", password: "admin123", role: "admin", createdAt: new Date().toISOString() });
  for (const c of ["BTC", "ETH", "USDT"]) {
    await storage.createWallet({ userId: admin.id, currency: c, balance: 0, address: genAddress(c) });
  }

  // Seed games
  const gameList = [
    { name: "Riverboat Keno", slug: "keno", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Roulette", slug: "roulette", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Hidden Treasure", slug: "mines", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Walk the Plank", slug: "tower", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Beached", slug: "crash", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Hitide Lowtide", slug: "hilow", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Helm", slug: "helm", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Blackjack", slug: "blackjack", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Slots", slug: "slots", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Plinko", slug: "plinko", rtp: 100, houseEdge: 0, isActive: true },
  ];
  for (const g of gameList) await storage.createGame(g);

  // Seed sports events
  const events = [
    { sport: "Football", league: "NFL", homeTeam: "Kansas City Chiefs", awayTeam: "San Francisco 49ers", startTime: new Date(Date.now() + 86400000).toISOString(), homeOdds: 1.85, drawOdds: null, awayOdds: 2.05, status: "upcoming" },
    { sport: "Basketball", league: "NBA", homeTeam: "Los Angeles Lakers", awayTeam: "Boston Celtics", startTime: new Date(Date.now() + 43200000).toISOString(), homeOdds: 2.10, drawOdds: null, awayOdds: 1.80, status: "upcoming" },
    { sport: "Soccer", league: "EPL", homeTeam: "Manchester City", awayTeam: "Liverpool", startTime: new Date(Date.now() + 172800000).toISOString(), homeOdds: 1.95, drawOdds: 3.40, awayOdds: 2.15, status: "upcoming" },
    { sport: "Baseball", league: "MLB", homeTeam: "St. Louis Cardinals", awayTeam: "Chicago Cubs", startTime: new Date(Date.now() + 3600000).toISOString(), homeOdds: 1.75, drawOdds: null, awayOdds: 2.20, status: "live" },
    { sport: "Soccer", league: "La Liga", homeTeam: "Real Madrid", awayTeam: "Barcelona", startTime: new Date(Date.now() + 259200000).toISOString(), homeOdds: 2.30, drawOdds: 3.10, awayOdds: 1.90, status: "upcoming" },
    { sport: "Football", league: "NFL", homeTeam: "Dallas Cowboys", awayTeam: "Philadelphia Eagles", startTime: new Date(Date.now() + 7200000).toISOString(), homeOdds: 2.00, drawOdds: null, awayOdds: 1.90, status: "live" },
  ];
  for (const e of events) {
    await storage.createSportsEvent(e as any);
  }

  // Seed 3 new games for existing databases
  for (const g of [
    { name: "Blackjack", slug: "blackjack", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Slots", slug: "slots", rtp: 100, houseEdge: 0, isActive: true },
    { name: "Plinko", slug: "plinko", rtp: 100, houseEdge: 0, isActive: true },
  ]) {
    const existing = await storage.getGameBySlug(g.slug);
    if (!existing) await storage.createGame(g);
  }

  // Seed bonus code
  await storage.createBonusCode({
    code: "WELCOME100",
    type: "percentage",
    value: 100,
    maxUses: 1000,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  });
}
