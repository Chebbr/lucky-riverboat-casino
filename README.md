# The Lucky Riverboat Casino & Sportsbook

The world's first casino with 0% house edge. Crypto-only. Provably fair.

## One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Chebbr/lucky-riverboat-casino)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template?repo=https://github.com/Chebbr/lucky-riverboat-casino)

## Features
- 10 House Original games (100% RTP, 0% house edge)
- Live Sportsbook with ESPN data (NFL, NBA, MLB, NHL, Soccer, UFC, Tennis)
- Parlay betting system
- NFT Cabin mint (444 unique keys, 4 VIP tiers)
- VIP Club with rakeback (Bronze → Diamond)
- Affiliate program (5% commission)
- Promo code system
- Live chat, live bet feed
- Autobet on all games
- Responsible gaming tools

## Stack
Express + Vite + React + Tailwind CSS + shadcn/ui + Drizzle ORM + SQLite

## Local Development
```bash
npm install
npm run dev
```

## Production
```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

## Docker
```bash
docker build -t lucky-riverboat .
docker run -p 5000:5000 lucky-riverboat
```
