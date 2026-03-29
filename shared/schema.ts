import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== USERS =====
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user | admin
  vipTier: text("vip_tier").notNull().default("none"), // none | bronze | silver | gold | platinum | diamond | cabin_owner
  totalWagered: real("total_wagered").notNull().default(0),
  createdAt: text("created_at").notNull().default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ===== WALLETS =====
export const wallets = sqliteTable("wallets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  currency: text("currency").notNull(), // BTC | ETH | USDT
  balance: real("balance").notNull().default(0),
  address: text("address").notNull().default(""),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true });
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

// ===== TRANSACTIONS =====
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // deposit | withdraw | bet | win | bonus | vault_deposit | vault_withdraw
  amount: real("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull().default("completed"), // pending | completed | rejected
  txHash: text("tx_hash"),
  createdAt: text("created_at").notNull().default(""),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// ===== GAMES =====
export const games = sqliteTable("games", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  rtp: real("rtp").notNull().default(100),
  houseEdge: real("house_edge").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const insertGameSchema = createInsertSchema(games).omit({ id: true });
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// ===== BETS =====
export const bets = sqliteTable("bets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  gameSlug: text("game_slug").notNull(),
  amount: real("amount").notNull(),
  multiplier: real("multiplier").notNull().default(0),
  payout: real("payout").notNull().default(0),
  currency: text("currency").notNull(),
  createdAt: text("created_at").notNull().default(""),
});

export const insertBetSchema = createInsertSchema(bets).omit({ id: true });
export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

// ===== BONUS CODES =====
export const bonusCodes = sqliteTable("bonus_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // fixed | percentage
  value: real("value").notNull(),
  maxUses: integer("max_uses").notNull().default(100),
  currentUses: integer("current_uses").notNull().default(0),
  expiresAt: text("expires_at"),
});

export const insertBonusCodeSchema = createInsertSchema(bonusCodes).omit({ id: true, currentUses: true });
export type InsertBonusCode = z.infer<typeof insertBonusCodeSchema>;
export type BonusCode = typeof bonusCodes.$inferSelect;

// ===== SUPPORT TICKETS =====
export const supportTickets = sqliteTable("support_tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // open | resolved
  createdAt: text("created_at").notNull().default(""),
  resolvedAt: text("resolved_at"),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, resolvedAt: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// ===== SPORTS EVENTS =====
export const sportsEvents = sqliteTable("sports_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sport: text("sport").notNull(),
  league: text("league").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  startTime: text("start_time").notNull(),
  homeOdds: real("home_odds").notNull(),
  drawOdds: real("draw_odds"),
  awayOdds: real("away_odds").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming | live | finished
});

export const insertSportsEventSchema = createInsertSchema(sportsEvents).omit({ id: true });
export type InsertSportsEvent = z.infer<typeof insertSportsEventSchema>;
export type SportsEvent = typeof sportsEvents.$inferSelect;

// ===== SPORTS BETS =====
export const sportsBets = sqliteTable("sports_bets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  prediction: text("prediction").notNull(), // home | draw | away
  amount: real("amount").notNull(),
  odds: real("odds").notNull(),
  payout: real("payout").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending | won | lost
  currency: text("currency").notNull(),
  createdAt: text("created_at").notNull().default(""),
});

export const insertSportsBetSchema = createInsertSchema(sportsBets).omit({ id: true });
export type InsertSportsBet = z.infer<typeof insertSportsBetSchema>;
export type SportsBet = typeof sportsBets.$inferSelect;

// ===== VIP PROGRESS / RAKEBACK =====
export const vipProgress = sqliteTable("vip_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  totalWagered: real("total_wagered").notNull().default(0),
  rakebackEarned: real("rakeback_earned").notNull().default(0),
  rakebackClaimed: real("rakeback_claimed").notNull().default(0),
  currentTier: text("current_tier").notNull().default("bronze"),
  updatedAt: text("updated_at"),
});

export const insertVipProgressSchema = createInsertSchema(vipProgress).omit({ id: true });
export type InsertVipProgress = z.infer<typeof insertVipProgressSchema>;
export type VipProgress = typeof vipProgress.$inferSelect;

// ===== PROMO CODES =====
export const promoCodes = sqliteTable("promo_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // 'fixed' | 'percentage'
  value: real("value").notNull(),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  expiresAt: text("expires_at"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true, currentUses: true });
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;

// ===== PROMO REDEMPTIONS =====
export const promoRedemptions = sqliteTable("promo_redemptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  promoCodeId: integer("promo_code_id").notNull(),
  amount: real("amount").notNull(),
  redeemedAt: text("redeemed_at"),
});

export const insertPromoRedemptionSchema = createInsertSchema(promoRedemptions).omit({ id: true });
export type InsertPromoRedemption = z.infer<typeof insertPromoRedemptionSchema>;
export type PromoRedemption = typeof promoRedemptions.$inferSelect;

// ===== AFFILIATES =====
export const affiliates = sqliteTable("affiliates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  referralCode: text("referral_code").notNull().unique(),
  totalReferrals: integer("total_referrals").notNull().default(0),
  totalCommission: real("total_commission").notNull().default(0),
  commissionRate: real("commission_rate").notNull().default(0.05), // 5%
  createdAt: text("created_at"),
});

export const insertAffiliateSchema = createInsertSchema(affiliates).omit({ id: true });
export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type Affiliate = typeof affiliates.$inferSelect;

// ===== REFERRALS =====
export const referrals = sqliteTable("referrals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  affiliateId: integer("affiliate_id").notNull(),
  referredUserId: integer("referred_user_id").notNull(),
  commission: real("commission").notNull().default(0),
  createdAt: text("created_at"),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true });
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
