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
}

export const storage = new DatabaseStorage();
