# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProfitPal (package name: `profitpal`) is a crypto position calculator and portfolio tracker web app. It lets users calculate potential returns on token positions by market cap targets or percentage gains, and track a portfolio of positions with live price data. Built by "Crypto Goats".

The actual app code lives in `bag-calculator-v2/` (nested directory).

## Commands

All commands must be run from `bag-calculator-v2/`:

```bash
cd bag-calculator-v2
npm install        # install dependencies
npm run dev        # start Vite dev server
npm run build      # production build
npm run preview    # preview production build
```

No test runner, linter, or formatter is configured.

## Architecture

React 18 + Vite SPA using HashRouter (react-router-dom). All styling is inline (no CSS files or CSS-in-JS library). No state management library — just React useState with localStorage for persistence.

### Routing

- `/` → Calculator page — single-position profit calculator
- `/portfolio` → Portfolio page — multi-position tracker with localStorage persistence

`App.jsx` owns the top-level layout, nav tabs, global CSS keyframes, and font imports (JetBrains Mono + Inter via Google Fonts).

### Key Files

- `src/components/shared.jsx` — Shared utilities and reusable components:
  - `formatCurrency`, `formatPrice`, `formatMultiplier` — display formatting helpers
  - `fetchTokenData(ca)` — fetches live token data from the DexScreener API (`api.dexscreener.com`), selects the pair with highest liquidity
  - `NumberInput`, `ResultCard`, `PulsingDot` — shared UI components
  - `chainLabels` — maps chain IDs to display abbreviations
  - `MONO`, `SANS` — font-family constants used everywhere

- `src/pages/Calculator.jsx` — Position calculator with CA auto-lookup, target by market cap or % gain, share-as-image (canvas-based), take-profit levels table, and comparable tokens table
- `src/pages/Portfolio.jsx` — Portfolio tracker storing positions in localStorage under key `profitpal_portfolio`. Supports add/remove/refresh positions with live DexScreener data.

### Design System

- Dark theme: background `#0D0D0D`, cards `#1A1A1A`, borders `#2A2A2A`
- Accent orange: `#F97316`
- Success green: `#22C55E`, Error red: `#EF4444`
- Fonts: JetBrains Mono (monospace, used for data/labels) and Inter (sans-serif, used for headings)
- Mobile-first layout capped at 480px max-width
