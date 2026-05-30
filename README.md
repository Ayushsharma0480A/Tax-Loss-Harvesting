# Tax-Loss-Harvesting

A responsive React application for simulating tax loss harvesting on crypto holdings. Built as part of the **KoinX Frontend Intern Assignment**.

---

## 🚀 Live Demo

> Deploy on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — see instructions below.

---

## ✨ Features

- **Pre-Harvesting & After-Harvesting cards** — real-time capital gains computation
- **Holdings table** with sortable columns, search filter, and logo fallbacks
- **Select / Deselect All** checkbox with indeterminate state
- **Savings banner** — appears only when harvesting reduces tax liability
- **"Best Loss Candidates" toggle** — surfaces assets with largest unrealised losses
- **Search filter** — find holdings by coin name or ticker instantly
- **View All / Show Less** toggle to expand beyond the default 5 rows
- **Skeleton loaders** with shimmer animation during API fetch
- **Error boundary** with retry action
- **"How it works?" tooltip** — hover to see step-by-step instructions
- **Fully responsive** — works on mobile, tablet, and desktop

---

## 🏗️ Folder Structure

```
src/
├── api/
│   └── mockApi.js          # Mock API with 800ms/600ms simulated delays
├── components/
│   ├── CapitalGainsCard.jsx # Pre/After harvesting card
│   └── HoldingsTable.jsx    # Holdings table with checkboxes, search, sort
├── hooks/
│   └── useHarvestingData.js # Core state logic, computation, sorting, filtering
├── utils/
│   └── formatters.js        # Currency, number, and price formatters
├── App.js                   # Root layout & page composition
├── App.css                  # Full design system via CSS variables
└── index.js                 # ReactDOM entry point
```

---

## 🔧 Setup & Run

```bash
# 1. Clone the repo
git clone https://github.com/Ayushsharma0480A/Tax-Loss-Harvesting.git
cd Tax-Loss-Harvesting

# 2. Install dependencies
npm install

# 3. Start the dev server
npm start
# Opens at http://localhost:3000
```

---

## 📦 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Or connect your GitHub repo directly at [vercel.com/new](https://vercel.com/new).

---

## 🧠 Business Logic

### Capital Gains Formula

```
Net STCG = stcg.profits − stcg.losses
Net LTCG = ltcg.profits − ltcg.losses
Realised Capital Gains = Net STCG + Net LTCG
```

### After-Harvesting Update (on selecting a holding)

For each selected asset:
- If `stcg.gain > 0` → add to `stcg.profits`
- If `stcg.gain < 0` → add absolute value to `stcg.losses`
- Same logic for `ltcg.gain`

### Savings Display

```
if (preRealised > postRealised) → show "You're going to save ₹X"
```

---

## ⚙️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Styling | Vanilla CSS (custom design system with CSS variables) |
| API Mocking | In-app Promises with simulated delay |
| Fonts | Syne (headings) + DM Sans (body) |
| State | React hooks — `useState`, `useEffect`, `useMemo` |

---

## 📝 Assumptions

1. Holdings index (original array position) is used as the unique identifier for selection state, since the same coin may appear multiple times.
2. Gains from `stcg` and `ltcg` are computed independently per holding.
3. "Amount to Sell" shows `totalHolding` with coin ticker when a row is selected.
4. Holdings are sorted by total gain (STCG + LTCG) descending by default.
5. The "View All" default shows the top 5 holdings by gain.
6. Savings are displayed only when post-harvesting realised gains are strictly less than pre-harvesting.

---

## 📄 License

MIT
