# ExpenseTracker — Personal Finance Management App

A full-stack personal finance web application built with React 19 and Firebase. Tracks income, expenses, savings goals, budgets, and split bills — with AI-powered features like voice input and receipt OCR.

---

## Live Demo

> _Add your deployed URL here (Vercel / Firebase Hosting / Netlify)_

---

## Features

### Core Finance Tracking
- **Dashboard** — Real-time balance, income, expense cards with account-scoped filtering; spending insights card with month-over-month comparisons and budget warnings
- **Transactions** — Full CRUD on transactions with search, date range filter, bulk delete, category tagging, and account linking
- **Multi-Account Support** — Link every transaction to a bank account; balance auto-updates on add/edit/delete; per-account transaction history; fund transfers between accounts
- **Budgets** — Set monthly spending limits per category; live progress bars with percentage tracking; toast alerts at 75% and 100% usage
- **Goals** — Create savings goals with emoji icons, target amounts, and deadlines; track progress with visual progress bars; add contributions over time
- **Split Bills** — Split restaurant/trip bills among friends; saves full bill history to Firestore; adds only your share as a transaction; deducts from selected account

### Analytics & Insights
- **Insights Page** — Combined trends and reports in one tabbed view; savings rate, net savings, avg transaction; line charts, pie charts, category breakdown bar charts
- **Spending Calendar** — Monthly heatmap calendar showing daily spend intensity (color-coded from gray to red); click any day to see that day's transactions
- **Reports Tab** — Month selector with pie chart breakdowns for expense/income categories; 6-month trend chart; Excel export via XLSX

### AI-Powered Features
- **Voice Input** — Speak a transaction naturally (_"Spent 500 on Zomato yesterday"_) and it auto-fills name, amount, category, and date using the Web Speech API — no external API required
- **Receipt OCR** — Upload a photo of any receipt; Gemini 1.5 Flash extracts merchant name, amount, and category automatically

### Auth & UX
- **Firebase Auth** — Email/password signup + Google OAuth; forgot password email flow; password show/hide toggle
- **Protected Routes** — All app pages require authentication; redirects unauthenticated users to login
- **Responsive Layout** — Collapsible sidebar on mobile; full desktop sidebar with account selector tabs
- **Light Theme** — Clean white/gray professional UI built with Tailwind CSS v4

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| UI Components | Ant Design v5, Recharts, Lucide React |
| Backend / DB | Firebase Firestore (NoSQL), Firebase Auth |
| AI / ML | Google Gemini 1.5 Flash API (Receipt OCR), Web Speech API (Voice) |
| Export | XLSX (Excel export) |
| Date Handling | Day.js, Moment.js |

---

## Architecture

```
src/
├── components/
│   ├── Modals/              # AddExpense, AddIncome, EditModal, Delete/Reset confirms
│   ├── AppLayout.jsx        # Sidebar, nav, protected shell
│   ├── BillSplitModal.jsx
│   ├── Cards.jsx            # Balance / Income / Expense cards
│   └── TransactionsTable.jsx
├── hooks/
│   ├── useTransactions.js   # CRUD + account balance sync via Firestore increment()
│   ├── useAccounts.js       # Account CRUD + transfer + totalBalance
│   ├── useBudgets.js
│   ├── useGoals.js          # Goals + contributions
│   └── useSplitBills.js
├── pages/
│   ├── Dashboard.jsx        # Overview with account selector tabs
│   ├── Transactions.jsx     # Full transaction management + account filter
│   ├── Accounts.jsx         # Account cards + per-account transaction history
│   ├── Insights.jsx         # Trends + Reports tabs
│   ├── Calendar.jsx         # Spending heatmap calendar
│   ├── Budgets.jsx
│   ├── Goals.jsx
│   └── SplitBills.jsx
└── firebase.js
```

Each feature is a self-contained custom hook that reads/writes to Firestore subcollections under `users/{uid}/...`. No Redux or Context API — just hooks and local component state.

---

## Key Technical Decisions

**Account-Transaction sync without a backend**
Every `addTransaction`, `deleteTransaction`, and `updateTransaction` call uses Firestore's `increment()` operator to atomically adjust the linked account's balance — no Cloud Functions needed, no race conditions.

**Infinite loop prevention**
`sortedTransactions` is memoized with `useMemo([transactions])` so the array reference stays stable across renders, preventing `useEffect` dependency loops in consumer components.

**Voice input with zero API cost**
Category detection uses regex keyword matching across 9 categories (~20 keywords each). Date parsing handles "today", "yesterday", "3 days ago", and weekday names — entirely client-side, instant, free.

**Gemini OCR integration**
Receipt images are base64-encoded in the browser and sent directly to the Gemini 1.5 Flash endpoint. The model returns structured JSON with merchant name, amount, and category in a single round-trip.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore and Authentication enabled
- (Optional) A Google Gemini API key for receipt OCR

### Installation

```bash
git clone https://github.com/ItishaJain123/expense-tracker.git
cd expense-tracker
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

---

## Firestore Data Model

```
users/{uid}/
  transactions/{id}   → name, amount, type, category, date, accountId
  accounts/{id}       → name, type, balance, createdAt
  budgets/{id}        → category spending limits
  goals/{id}          → name, emoji, targetAmount, savedAmount, deadline
  splitBills/{id}     → billName, totalAmount, tip, people[], perPerson, myShare, date
```

---

## What I Built & Learned

- Designed and shipped a **production-grade SPA** from scratch — real auth, real-time Firestore data, multi-page nested routing
- Integrated **three external APIs** (Firebase, Gemini 1.5 Flash, Web Speech API) with clean error handling and graceful fallbacks
- Built a **live account balance sync layer** — every transaction atomically updates the linked account using Firestore's `increment()`, keeping data consistent without a backend server
- Implemented **AI features without overengineering** — voice input is pure regex (instant, free), OCR is a single fetch call to Gemini (accurate, cheap)
- Handled real UX edge cases: duplicate prevention, blank field validation, budget overflow alerts, password reset, infinite render loop fixes

---

## Author

**Itisha Jain**
- GitHub: [@ItishaJain123](https://github.com/ItishaJain123)
- Email: itu.yash3003@gmail.com
