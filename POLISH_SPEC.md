# Polish Spec: Match AI Studio Project Aesthetic

## Background Treatment (CRITICAL FIX)
The original uses `bg-[#1a120b]` — a warm dark brown/mahogany. NOT cold navy, NOT black.
- Base color: `#1a120b` (warm dark chocolate-brown)
- Wood texture overlay at 20% opacity: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`
- Gradient overlay: `from-black/20 via-transparent to-black/40`
- Vignette: `radial-gradient(circle_at_center, transparent_0%, rgba(0,0,0,0.4) 100%)`
- Floating card suits background (♥ ♦ ♠ ♣ with neon colors) at 40% opacity

## Color Variables (HSL for Tailwind v3)
- `--background: 20 30% 7%` (warm brown-black, #1a120b equivalent)
- `--foreground: 40 10% 90%` (warm white)
- `--card: 20 20% 10%` (slightly lighter warm brown)
- `--card-foreground: 40 10% 90%`
- `--primary: 45 93% 47%` (gold — keep)
- `--primary-foreground: 20 30% 5%` (dark brown)
- `--secondary: 20 15% 14%`
- `--muted: 20 15% 14%`
- `--muted-foreground: 30 5% 50%`
- `--border: 20 10% 18%`
- `--input: 20 15% 14%`

## oklch custom properties update
- `--gold: oklch(0.78 0.12 85)` (keep)
- `--ink: #1a120b` (the base background)
- `--ink-light: #231912` (slightly lighter)

## Design Language
- Font: Cinzel for headings (serif), Inter for body (sans)
- Headings use `.gold-text-gradient` (gold text gradient) or plain white
- Labels use `uppercase tracking-[0.3em] text-[10px] font-bold` 
- Section backgrounds alternate between transparent and `bg-black/20`
- Large blur glows (`bg-gold/5 blur-[150px]`) as ambient light sources
- Glass panels: `bg-white/5 backdrop-blur-md border border-white/10`
- Buttons: gold background with ink text, rounded-full, uppercase tracking-widest
- Cards: `bg-white/5 border border-white/10 backdrop-blur-sm`

## Key Visual Elements to Add
1. **CardSuitsBackground** — Fixed position, 40 floating card suit symbols (♥ ♦ ♠ ♣) with neon colors, animating float/rotate, at 40% opacity
2. **Wood texture** — Applied as a fixed background layer
3. **Vignette overlay** — Darkens edges
4. **Large ambient gold blurs** — Behind key sections
5. **glass-panel class** — Updated to use warm `bg-white/5` instead of navy-based

## Files Changed

### index.css
- Background shifted from cold navy to warm mahogany brown
- All navy references replaced with warm ink tones
- glass-panel updated
- Added `.gold-text-gradient` utility (Cinzel gradient text)

### layout.tsx
- Add wood texture + vignette as fixed backgrounds
- Add CardSuitsBackground component
- Navbar glass effect based on scroll position
- Update footer with premium typography (tracking-widest uppercase)

### home.tsx  
- Hero: large Cinzel heading, gold text gradient
- Sections use `bg-black/20` alternation
- Add ambient gold blur backgrounds to sections
- Game cards use gradient backgrounds with images, not emoji cards
- Premium luxury spacing (py-32)

### New: card-suits-background.tsx
- 40 floating card suit symbols
- Neon colors: pink ♥, orange ♦, cyan ♠, green ♣
- Float, rotate, scale animations
- 40% opacity layer
