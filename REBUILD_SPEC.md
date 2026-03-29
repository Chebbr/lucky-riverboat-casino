# Rebuild Spec: Match Original AI Studio Design

## Goal
Transform the current build (HSL colors, flat nav, image-based game cards) to match the user's original Google AI Studio project (oklch colors, Games dropdown nav, emoji game cards, ChatOverlay, WagerFeedWidget, particle effects).

## CRITICAL CONSTRAINTS
- Current build uses **Tailwind v3** (`@tailwind base; @tailwind components; @tailwind utilities;`). Do NOT use `@import "tailwindcss"` or `@theme inline` — those are v4 and will crash the build.
- Keep HSL `H S% L%` format for the shadcn CSS variables (--background, --foreground, etc.) because Tailwind v3 expects them.
- ADD oklch-based custom properties (--gold, --navy etc.) separately for custom utilities.
- Use `wouter` hash routing. Router hook is `useHashLocation` on `<Router>`.
- Do NOT use `localStorage`/`sessionStorage` — blocked in sandbox iframe.
- Existing auth uses `useAuth` from `@/hooks/use-auth` (NOT `@/_core/hooks/useAuth`).
- Asset imports use `@assets/` alias (e.g., `import neonLogo from "@assets/Neon-Riverboat-Logo.png"`).
- The existing backend/API/games/wallet/auth all work perfectly. Only touching frontend CSS + components + pages.

## Files to Modify

### 1. `/client/src/index.css` — Theme Overhaul
Replace the current CSS with these changes:
- Keep `@tailwind base; @tailwind components; @tailwind utilities;` (v3 syntax)
- Keep HSL shadcn variables but update values to match oklch gold/navy palette:
  - `--background: 243 30% 5%` (deep navy)
  - `--foreground: 45 30% 93%` (warm off-white)
  - `--card: 243 25% 9%` (navy-light)
  - `--card-foreground: 45 30% 93%`
  - `--primary: 45 93% 47%` (gold)
  - `--primary-foreground: 243 30% 5%` (dark navy for text on gold)
  - `--secondary: 243 20% 15%` (navy-lighter)
  - `--secondary-foreground: 45 30% 88%`
  - `--muted: 243 20% 15%`
  - `--muted-foreground: 45 10% 55%`
  - `--accent: 45 93% 47%` (gold)
  - `--accent-foreground: 243 30% 5%`
  - `--border: 243 15% 20%`
  - `--input: 243 15% 18%`
  - `--ring: 45 93% 47%`
  - `--destructive: 0 72% 51%`
  - `--destructive-foreground: 0 0% 98%`
- Add custom properties (NOT in HSL):
  ```css
  --gold: oklch(0.78 0.12 85);
  --gold-light: oklch(0.85 0.10 85);
  --gold-dark: oklch(0.65 0.12 85);
  --navy: oklch(0.12 0.01 260);
  --navy-light: oklch(0.18 0.015 260);
  --navy-lighter: oklch(0.24 0.02 260);
  ```
- Add utility classes in `@layer utilities`:
  - `.text-gold { color: var(--gold); }`
  - `.text-gold-light { color: var(--gold-light); }`
  - `.bg-navy { background-color: var(--navy); }`
  - `.bg-navy-light { background-color: var(--navy-light); }`
  - `.bg-navy-lighter { background-color: var(--navy-lighter); }`
  - `.glow-gold { box-shadow: 0 0 20px oklch(0.78 0.12 85 / 0.3), 0 0 40px oklch(0.78 0.12 85 / 0.1); }`
  - `.glow-gold-sm { box-shadow: 0 0 10px oklch(0.78 0.12 85 / 0.2); }`
  - `.text-shadow-gold { text-shadow: 0 0 10px oklch(0.78 0.12 85 / 0.5); }`
- Add keyframe animations: `float`, `pulseGold`, `shimmer`
- Keep scrollbar styling, `font-display` class, `btn-casino` but updated to oklch
- Keep `glass-panel`, `game-tile`, `gold-text`, `gold-gradient` utilities but keep as-is since they still work
- Add `shine-effect` animation

### 2. `/client/src/components/layout.tsx` — Complete Rewrite → CasinoLayout
Replace the current flat-nav Layout with the original CasinoLayout pattern:
- Top navbar with:
  - Logo (Poker-Chip-Logo.png) + "The Lucky Riverboat" text in Cinzel
  - Desktop nav: Home, **Games dropdown** (with emoji icons for each game), Sportsbook, Dashboard, Wallet
  - Games dropdown shows all 10 games with emojis:
    - Riverboat Keno 🎱, Beached 🚀, Roulette 🎰, Helm 🎡, Walk the Plank 🏴‍☠️, Hidden Treasure 💎, Hitide Lowtide 🃏, Blackjack 🃏, Slots 🎰, Plinko ⚪
  - User dropdown (avatar initial, name, ChevronDown) with Profile/Dashboard/Wallet/Admin/Sign Out
  - Balance display in the nav
- Mobile menu with game list
- ChatOverlay component rendered
- Footer: logo + copyright + "Play responsibly. Must be 18+ to participate."
- Use click-outside pattern for dropdowns
- Active state highlighting using `useLocation`

### 3. `/client/src/components/wager-feed-widget.tsx` — New File
Port the WagerFeedWidget from the original. Since there's no actual Socket.IO wager broadcasting yet, create a simulated version:
- Generate simulated wager data on an interval (every 2-5 seconds)
- Show user names, game emoji, bet amount, multiplier, win/loss status
- ScrollArea with last 20 wagers
- Color coding: green for wins, red for losses
- Use the same structure as the original reference

### 4. `/client/src/components/chat-overlay.tsx` — New File
Port the ChatOverlay from the original:
- Floating chat button (bottom-right, gold bg)
- Expandable chat panel with header, messages, input
- Since no Socket.IO chat backend exists yet, create a local-state chat that works for the current user
- Online player count indicator
- Message history display

### 5. `/client/src/pages/home.tsx` — Complete Rewrite
Rebuild to match the original Home.tsx pattern:
- **Hero Section**: 
  - Particle effect background (20 animated dots using framer-motion)
  - Gradient overlay from primary/5
  - Neon-Riverboat-Logo.png centered (import from `@assets/Neon-Riverboat-Logo.png`)
  - "100% RTP • 0% House Edge" badge with sparkle icons
  - "The First Casino With 0% House Edge" heading in Cinzel with text-gold text-shadow-gold
  - Description paragraphs
  - CTA buttons: "Start Playing" (gold, glow-gold) + "Sportsbook" (outline)
- **Why 0% House Edge Section**:
  - Two comparison cards side by side
  - Traditional Casinos (red border, red accent, ✗ items)
  - The Lucky Riverboat (gold/primary border, glow-gold-sm, ✓ items in green)
- **Meet Xebb Section**:
  - Two-column grid: image left (Meet-Xebb.jpg), text right
  - Heading "Meet Xebb" with text-gold
  - Description paragraphs about Xebb
  - "Watch on Kick.com" button linking to kick.com/x3bb3r
- **Feature Cards**: 3-column grid (100% RTP, 0% House Edge, Instant Crypto)
- **Games Grid**: 
  - "Ten Exclusive Games" heading
  - Grid of emoji-based game cards (NO images, just big emoji + name + description)
  - All 10 games with their emojis
- **Live Wager Feed Section**: WagerFeedWidget component
- **CTA Footer**: "Ready to Set Sail?" with crypto icons (BTC, ETH, Debit) and "Deposit Now" button

### 6. `/client/src/App.tsx` — Minor Update
- Remove the `<Layout>` wrapper from `AppRouter`
- Each page that needs the CasinoLayout wraps itself (or keep the Layout as-is and just rename the component)
- Actually, the simpler approach: keep the Layout wrapper in App.tsx, just make the Layout component match CasinoLayout's design.

## Games List (all 10, with emojis for dropdown and game cards)
| Name | Slug | Path | Emoji |
|------|------|------|-------|
| Riverboat Keno | keno | /games/keno | 🎱 |
| Beached | crash | /games/crash | 🚀 |
| Roulette | roulette | /games/roulette | 🎰 |
| Helm | helm | /games/helm | 🎡 |
| Walk the Plank | tower | /games/tower | 🏴‍☠️ |
| Hidden Treasure | mines | /games/mines | 💎 |
| Hitide Lowtide | hilow | /games/hilow | 🃏 |
| Blackjack | blackjack | /games/blackjack | 🃏 |
| Slots | slots | /games/slots | 🎰 |
| Plinko | plinko | /games/plinko | ⚪ |

## Branded Assets Available
All at `attached_assets/` (import with `@assets/`):
- Neon-Riverboat-Logo.png — hero neon logo
- Poker-Chip-Logo.png — nav/footer logo
- Meet-Xebb.jpg — Meet Xebb section
- ZeroHouseEdge.png — can use in house edge section
- Metaverse-Hover.jpg — can use as background
- HouseOriginals.png
- MarkMcGwire.png
- blackjack.png
- plinko.png
- Watermark.jpg
