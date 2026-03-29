-- VIP/Rakeback tracking
CREATE TABLE IF NOT EXISTS `vip_progress` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL,
  `total_wagered` real NOT NULL DEFAULT 0,
  `rakeback_earned` real NOT NULL DEFAULT 0,
  `rakeback_claimed` real NOT NULL DEFAULT 0,
  `current_tier` text NOT NULL DEFAULT 'bronze',
  `updated_at` text
);

-- Promo codes
CREATE TABLE IF NOT EXISTS `promo_codes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `code` text NOT NULL UNIQUE,
  `type` text NOT NULL,
  `value` real NOT NULL,
  `max_uses` integer,
  `current_uses` integer NOT NULL DEFAULT 0,
  `expires_at` text,
  `is_active` integer NOT NULL DEFAULT 1
);

-- Promo code redemptions
CREATE TABLE IF NOT EXISTS `promo_redemptions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL,
  `promo_code_id` integer NOT NULL,
  `amount` real NOT NULL,
  `redeemed_at` text
);

-- Affiliate tracking
CREATE TABLE IF NOT EXISTS `affiliates` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL,
  `referral_code` text NOT NULL UNIQUE,
  `total_referrals` integer NOT NULL DEFAULT 0,
  `total_commission` real NOT NULL DEFAULT 0,
  `commission_rate` real NOT NULL DEFAULT 0.05,
  `created_at` text
);

-- Referrals
CREATE TABLE IF NOT EXISTS `referrals` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `affiliate_id` integer NOT NULL,
  `referred_user_id` integer NOT NULL,
  `commission` real NOT NULL DEFAULT 0,
  `created_at` text
);
