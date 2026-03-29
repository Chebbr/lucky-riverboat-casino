import {
  type User, type InsertUser, users,
  type Wallet, type InsertWallet, wallets,
  type Transaction, type InsertTransaction, transactions,
  type Game, type InsertGame, games,
  type Bet, type InsertBet, bets,
  type BonusCode, type InsertBonusCode, bonusCodes,
  type SupportTicket, type InsertSupportTicket, supportTickets,
  type SportsEvent, type InsertSportsEvent, sportsEvents,
  type SportsBet, type InsertSportsBet, sportsBets,
  type VipProgress, vipProgress,
  type PromoCode, promoCodes,
  type PromoRedemption, promoRedemptions,
  type Affiliate, affiliates,
  type Referral, referrals,
  type InsertPromoCode,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, desc, sql } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { role?: string; createdAt?: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserWagered(id: number, amount: number): Promise<void>;
  updateUserVipTier(id: number, tier: string): Promise<void>;

  // Wallets
  getWalletsByUser(userId: number): Promise<Wallet[]>;
  getWallet(userId: number, currency: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: number, balance: number): Promise<void>;

  // Transactions
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  getPendingWithdrawals(): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<void>;

  // Games
  getGames(): Promise<Game[]>;
  getGameBySlug(slug: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGameRtp(id: number, rtp: number, houseEdge: number): Promise<void>;

  // Bets
  createBet(bet: InsertBet): Promise<Bet>;
  getBetsByUser(userId: number): Promise<Bet[]>;
  getAllBets(): Promise<Bet[]>;

  // Bonus Codes
  getBonusCodes(): Promise<BonusCode[]>;
  getBonusCodeByCode(code: string): Promise<BonusCode | undefined>;
  createBonusCode(bonus: InsertBonusCode): Promise<BonusCode>;
  incrementBonusCodeUses(id: number): Promise<void>;

  // Support Tickets
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicketsByUser(userId: number): Promise<SupportTicket[]>;

  // Sports Events
  getSportsEvents(): Promise<SportsEvent[]>;
  getSportsEvent(id: number): Promise<SportsEvent | undefined>;
  createSportsEvent(event: InsertSportsEvent): Promise<SportsEvent>;

  // Sports Bets
  createSportsBet(bet: InsertSportsBet): Promise<SportsBet>;
  getSportsBetsByUser(userId: number): Promise<SportsBet[]>;

  // VIP / Rakeback
  getVipProgress(userId: number): Promise<VipProgress | undefined>;
  updateVipProgress(userId: number, wagered: number): Promise<void>;
  claimRakeback(userId: number): Promise<number>;

  // Promo Codes
  getPromoCode(code: string): Promise<PromoCode | undefined>;
  redeemPromoCode(userId: number, code: string): Promise<{ success: boolean; amount: number; message: string }>;
  getPromoCodes(): Promise<PromoCode[]>;
  createPromoCode(data: InsertPromoCode): Promise<PromoCode>;

  // Affiliates
  getAffiliate(userId: number): Promise<Affiliate | undefined>;
  createAffiliate(userId: number): Promise<Affiliate>;
  getAffiliateByCode(code: string): Promise<Affiliate | undefined>;
  getAffiliateReferrals(affiliateId: number): Promise<Referral[]>;
  addReferral(affiliateId: number, referredUserId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  async createUser(user: InsertUser & { role?: string; createdAt?: string }): Promise<User> {
    return db.insert(users).values({
      ...user,
      role: user.role || "user",
      createdAt: user.createdAt || new Date().toISOString(),
    }).returning().get();
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).all();
  }

  async updateUserWagered(id: number, amount: number): Promise<void> {
    const user = await this.getUser(id);
    if (user) {
      db.update(users).set({ totalWagered: user.totalWagered + amount }).where(eq(users.id, id)).run();
    }
  }

  async updateUserVipTier(id: number, tier: string): Promise<void> {
    db.update(users).set({ vipTier: tier }).where(eq(users.id, id)).run();
  }

  // Wallets
  async getWalletsByUser(userId: number): Promise<Wallet[]> {
    return db.select().from(wallets).where(eq(wallets.userId, userId)).all();
  }

  async getWallet(userId: number, currency: string): Promise<Wallet | undefined> {
    return db.select().from(wallets).where(
      and(eq(wallets.userId, userId), eq(wallets.currency, currency))
    ).get();
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    return db.insert(wallets).values(wallet).returning().get();
  }

  async updateWalletBalance(id: number, balance: number): Promise<void> {
    db.update(wallets).set({ balance }).where(eq(wallets.id, id)).run();
  }

  // Transactions
  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    return db.insert(transactions).values({
      ...tx,
      createdAt: tx.createdAt || new Date().toISOString(),
    }).returning().get();
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.id)).all();
  }

  async getPendingWithdrawals(): Promise<Transaction[]> {
    return db.select().from(transactions).where(
      and(eq(transactions.type, "withdraw"), eq(transactions.status, "pending"))
    ).all();
  }

  async updateTransactionStatus(id: number, status: string): Promise<void> {
    db.update(transactions).set({ status }).where(eq(transactions.id, id)).run();
  }

  // Games
  async getGames(): Promise<Game[]> {
    return db.select().from(games).all();
  }

  async getGameBySlug(slug: string): Promise<Game | undefined> {
    return db.select().from(games).where(eq(games.slug, slug)).get();
  }

  async createGame(game: InsertGame): Promise<Game> {
    return db.insert(games).values(game).returning().get();
  }

  async updateGameRtp(id: number, rtp: number, houseEdge: number): Promise<void> {
    db.update(games).set({ rtp, houseEdge }).where(eq(games.id, id)).run();
  }

  // Bets
  async createBet(bet: InsertBet): Promise<Bet> {
    return db.insert(bets).values({
      ...bet,
      createdAt: bet.createdAt || new Date().toISOString(),
    }).returning().get();
  }

  async getBetsByUser(userId: number): Promise<Bet[]> {
    return db.select().from(bets).where(eq(bets.userId, userId)).orderBy(desc(bets.id)).all();
  }

  async getAllBets(): Promise<Bet[]> {
    return db.select().from(bets).orderBy(desc(bets.id)).all();
  }

  // Bonus Codes
  async getBonusCodes(): Promise<BonusCode[]> {
    return db.select().from(bonusCodes).all();
  }

  async getBonusCodeByCode(code: string): Promise<BonusCode | undefined> {
    return db.select().from(bonusCodes).where(eq(bonusCodes.code, code)).get();
  }

  async createBonusCode(bonus: InsertBonusCode): Promise<BonusCode> {
    return db.insert(bonusCodes).values(bonus).returning().get();
  }

  async incrementBonusCodeUses(id: number): Promise<void> {
    db.update(bonusCodes).set({
      currentUses: sql`${bonusCodes.currentUses} + 1`
    }).where(eq(bonusCodes.id, id)).run();
  }

  // Support Tickets
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    return db.insert(supportTickets).values({
      ...ticket,
      createdAt: ticket.createdAt || new Date().toISOString(),
    }).returning().get();
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).all();
  }

  // Sports Events
  async getSportsEvents(): Promise<SportsEvent[]> {
    return db.select().from(sportsEvents).all();
  }

  async getSportsEvent(id: number): Promise<SportsEvent | undefined> {
    return db.select().from(sportsEvents).where(eq(sportsEvents.id, id)).get();
  }

  async createSportsEvent(event: InsertSportsEvent): Promise<SportsEvent> {
    return db.insert(sportsEvents).values(event).returning().get();
  }

  // Sports Bets
  async createSportsBet(bet: InsertSportsBet): Promise<SportsBet> {
    return db.insert(sportsBets).values({
      ...bet,
      createdAt: bet.createdAt || new Date().toISOString(),
    }).returning().get();
  }

  async getSportsBetsByUser(userId: number): Promise<SportsBet[]> {
    return db.select().from(sportsBets).where(eq(sportsBets.userId, userId)).orderBy(desc(sportsBets.id)).all();
  }

  // ===== VIP TIER HELPERS =====
  private getVipTierInfo(totalWagered: number): { tier: string; rakebackRate: number } {
    if (totalWagered >= 250000) return { tier: "diamond", rakebackRate: 0.03 };
    if (totalWagered >= 50000)  return { tier: "platinum", rakebackRate: 0.02 };
    if (totalWagered >= 10000) return { tier: "gold",     rakebackRate: 0.015 };
    if (totalWagered >= 1000)  return { tier: "silver",   rakebackRate: 0.01 };
    return { tier: "bronze", rakebackRate: 0.005 };
  }

  // ===== VIP / RAKEBACK =====
  async getVipProgress(userId: number): Promise<VipProgress | undefined> {
    return db.select().from(vipProgress).where(eq(vipProgress.userId, userId)).get();
  }

  async updateVipProgress(userId: number, wagered: number): Promise<void> {
    const existing = await this.getVipProgress(userId);
    const newTotal = (existing?.totalWagered ?? 0) + wagered;
    const { tier, rakebackRate } = this.getVipTierInfo(newTotal);
    const earnedThisBet = wagered * rakebackRate;
    const newEarned = (existing?.rakebackEarned ?? 0) + earnedThisBet;

    if (existing) {
      db.update(vipProgress).set({
        totalWagered: newTotal,
        rakebackEarned: newEarned,
        currentTier: tier,
        updatedAt: new Date().toISOString(),
      }).where(eq(vipProgress.userId, userId)).run();
    } else {
      db.insert(vipProgress).values({
        userId,
        totalWagered: newTotal,
        rakebackEarned: newEarned,
        rakebackClaimed: 0,
        currentTier: tier,
        updatedAt: new Date().toISOString(),
      }).run();
    }
  }

  async claimRakeback(userId: number): Promise<number> {
    const progress = await this.getVipProgress(userId);
    if (!progress) return 0;

    const unclaimed = progress.rakebackEarned - progress.rakebackClaimed;
    if (unclaimed <= 0) return 0;

    // Credit USDT wallet
    const wallet = await this.getWallet(userId, "USDT");
    if (wallet) {
      await this.updateWalletBalance(wallet.id, wallet.balance + unclaimed);
    }

    // Mark as claimed
    db.update(vipProgress).set({
      rakebackClaimed: progress.rakebackEarned,
      updatedAt: new Date().toISOString(),
    }).where(eq(vipProgress.userId, userId)).run();

    // Record transaction
    await this.createTransaction({
      userId,
      type: "bonus",
      amount: unclaimed,
      currency: "USDT",
      status: "completed",
      txHash: null,
      createdAt: new Date().toISOString(),
    });

    return unclaimed;
  }

  // ===== PROMO CODES =====
  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    return db.select().from(promoCodes).where(eq(promoCodes.code, code.toUpperCase())).get();
  }

  async getPromoCodes(): Promise<PromoCode[]> {
    return db.select().from(promoCodes).all();
  }

  async createPromoCode(data: InsertPromoCode): Promise<PromoCode> {
    return db.insert(promoCodes).values({ ...data, code: data.code.toUpperCase() }).returning().get();
  }

  async redeemPromoCode(userId: number, code: string): Promise<{ success: boolean; amount: number; message: string }> {
    const promo = await this.getPromoCode(code);

    if (!promo) return { success: false, amount: 0, message: "Invalid promo code" };
    if (!promo.isActive) return { success: false, amount: 0, message: "Promo code is inactive" };
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return { success: false, amount: 0, message: "Promo code has expired" };
    }
    if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
      return { success: false, amount: 0, message: "Promo code has reached its usage limit" };
    }

    // Check if user already redeemed this code
    const existing = db.select().from(promoRedemptions).where(
      and(eq(promoRedemptions.userId, userId), eq(promoRedemptions.promoCodeId, promo.id))
    ).get();
    if (existing) return { success: false, amount: 0, message: "You have already redeemed this code" };

    // Determine bonus amount
    let bonusAmount = 0;
    if (promo.type === "fixed") {
      bonusAmount = promo.value;
    } else if (promo.type === "percentage") {
      // Percentage match on USDT balance
      const wallet = await this.getWallet(userId, "USDT");
      const balance = wallet?.balance ?? 0;
      bonusAmount = balance * (promo.value / 100);
      if (bonusAmount <= 0) bonusAmount = promo.value; // fallback: treat as fixed if balance is 0
    }

    // Credit USDT wallet
    const wallet = await this.getWallet(userId, "USDT");
    if (wallet) {
      await this.updateWalletBalance(wallet.id, wallet.balance + bonusAmount);
    }

    // Record redemption
    db.insert(promoRedemptions).values({
      userId,
      promoCodeId: promo.id,
      amount: bonusAmount,
      redeemedAt: new Date().toISOString(),
    }).run();

    // Increment uses
    db.update(promoCodes).set({
      currentUses: sql`${promoCodes.currentUses} + 1`,
    }).where(eq(promoCodes.id, promo.id)).run();

    // Record transaction
    await this.createTransaction({
      userId,
      type: "bonus",
      amount: bonusAmount,
      currency: "USDT",
      status: "completed",
      txHash: null,
      createdAt: new Date().toISOString(),
    });

    return { success: true, amount: bonusAmount, message: `Promo code redeemed! +${bonusAmount.toFixed(2)} USDT credited` };
  }

  // ===== AFFILIATES =====
  async getAffiliate(userId: number): Promise<Affiliate | undefined> {
    return db.select().from(affiliates).where(eq(affiliates.userId, userId)).get();
  }

  async createAffiliate(userId: number): Promise<Affiliate> {
    // Generate a unique referral code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    const referralCode = `REF${code}`;

    return db.insert(affiliates).values({
      userId,
      referralCode,
      totalReferrals: 0,
      totalCommission: 0,
      commissionRate: 0.05,
      createdAt: new Date().toISOString(),
    }).returning().get();
  }

  async getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
    return db.select().from(affiliates).where(eq(affiliates.referralCode, code.toUpperCase())).get();
  }

  async getAffiliateReferrals(affiliateId: number): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.affiliateId, affiliateId)).all();
  }

  async addReferral(affiliateId: number, referredUserId: number): Promise<void> {
    db.insert(referrals).values({
      affiliateId,
      referredUserId,
      commission: 0,
      createdAt: new Date().toISOString(),
    }).run();

    db.update(affiliates).set({
      totalReferrals: sql`${affiliates.totalReferrals} + 1`,
    }).where(eq(affiliates.id, affiliateId)).run();
  }
}

export const storage = new DatabaseStorage();
