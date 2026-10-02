# Book Worm — Online Bookstore Platform

Book Worm is a responsive, modern e-commerce storefront for an online bookstore, paired with a Medusa v2 backend and PostgreSQL database.

Customers can browse books by category, writer, and publisher, manage a shopping cart, apply promotional coupons and loyalty gift points, checkout with multiple payment methods (Card, UPI, Wallet), track their order history, request order cancellation within a 48-hour window, and write customer book reviews.

---

## 1. Architecture & Tech Stack

### Storefront (Frontend)
- **Framework & Runtime**: React 19, Vite, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, IBM Plex Sans typography, Carbon Icons (`@carbon/icons-react`)
- **State & Routing**: React Router v7, TanStack Query v5
- **Forms & Validation**: React Hook Form, Zod
- **SDK**: `@medusajs/js-sdk` (v2.21)
- **Testing**: Vitest, React Testing Library, Playwright (desktop, mobile, tablet), MSW (Mock Service Worker v3)

### Store Backend (`backend/apps/backend`)
- **Framework**: Medusa v2.21 (Turborepo structure)
- **Database**: PostgreSQL 16 (via Docker / OrbStack on port 5433)
- **Custom Modules & Extensions**:
  - **Brands Module**: Writer and publisher profiles linked to products (`/store/writers`, `/store/publishers`).
  - **Catalog Extensions**: Bestsellers ranking endpoint (`/store/catalog/bestsellers`).
  - **Cancellation Module**: 48-hour customer cancellation request flow (`POST /store/orders/:id/cancel-request`).
  - **Loyalty Module**: Gift points balance, ledger, redemption promo generator (`/store/customers/me/loyalty-points`, `/store/carts/:id/loyalty-points`), and automatic order reward points subscriber.
  - **Product Review Module**: Customer reviews and ratings (`/store/products/:id/reviews`, `POST /store/reviews`).
  - **Delivery Provider (`bookworm-delivery`)**: Custom calculated shipping provider implementing the free delivery threshold (₹40 standard shipping, free above ₹499 pre-discount subtotal).

---

## 2. Development Modes

Book Worm supports two development modes:

### A. Mock Mode (Default)
- **Command**: `npm run dev` (http://localhost:5173)
- **How it works**: Uses Mock Service Worker (MSW) running in the browser to emulate Medusa v2 endpoints and shapes.
- **Benefits**: Zero external dependencies (no Docker or PostgreSQL required). Fast, deterministic, and fully offline.
- **Tests**: All unit tests (`npm test`) and the Playwright mock E2E suite (`npm run test:e2e`) run in this mode.

### B. Live Mode
- **Command**: `npm run dev:live`
- **How it works**: Bypasses MSW and connects directly to the local Medusa v2 backend at `http://localhost:9100`.
- **Configuration**: Loads `.env.live` (mode and URL) and `.env.live.local` (publishable key and region, written by `npm run live:env`).
- **E2E Integration Test**: `npm run test:e2e:live` runs every E2E spec on desktop against the live seeded backend. Run `npm run db:reset` first: the specs expect a freshly seeded database (e.g. demo order #1002 not yet cancelled).

---

## 3. Environment Variables

| Variable | Default (Mock) | Live Mode (`.env.live`) | Description |
|---|---|---|---|
| `VITE_API_MODE` | `mock` | `live` | Toggle between MSW in-browser mocking and real API calls |
| `VITE_MEDUSA_URL` | — | `http://localhost:9100` | Base URL of the Medusa v2 backend server |
| `VITE_MEDUSA_PUBLISHABLE_KEY` | `pk_mock` | from `.env.live.local` | Publishable key for sales channel authentication |
| `VITE_MEDUSA_REGION_ID` | `reg_india` | from `.env.live.local` | Region ID for India (INR, 12% GST) |

The seed creates a new publishable key and region id on every fresh database, so they are not committed: `npm run live:env` reads them from PostgreSQL and writes `.env.live.local` (ignored by git).

---

## 4. Quick Start (Live Backend)

### Prerequisites
- Node.js 20+ (tested on Node v24 LTS / current)
- Docker or OrbStack

### Setup Steps

1. **Start PostgreSQL database**:
   ```bash
   npm run db:up
   ```
   *Runs PostgreSQL 16 on host port `5433` (mapped from container `5432`) to avoid collisions with system Postgres.*

2. **Install backend dependencies**:
   ```bash
   npm run backend:install
   ```

3. **Run database migrations and seed data**:
   ```bash
   npm run backend:migrate
   ```
   *This executes Medusa migrations and runs the Book Worm seed script (`bookworm-seed.ts`), populating catalogue books, categories, writers, publishers, demo customer, promotions, and demo orders.*

4. **Write the storefront's live env** (publishable key and region of this database):
   ```bash
   npm run live:env
   ```

5. **Start Medusa backend dev server**:
   ```bash
   npm run backend:dev
   ```
   *Backend starts on `http://localhost:9100` (Medusa Admin available at `http://localhost:9100/app`).*

6. **Start frontend in live mode**:
   ```bash
   npm run dev:live
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 5. Seed Data & Demo Accounts

### Customer Account
- **Email**: `reader@bookworm.test`
- **Password**: `bookworm123`
- **Name**: Asha Verma
- **Gift Points**: 120 points (can be redeemed for up to 50% discount on cart subtotal)
- **Saved Address**: 12 MG Road, Indiranagar, Bengaluru, Karnataka, 560038

### Demo Orders
- **Order #1001**: Placed 10 days ago (240 hours). Beyond the 48-hour cancellation threshold (cancellation button disabled).
- **Order #1002**: Placed 2 hours ago. Within the 48-hour cancellation threshold (cancellation can be requested).

### Promotional Coupons
- `BOOKWORM100`: ₹100 flat discount on orders with subtotal ₹300 or greater.
- `READMORE10`: 10% percentage discount on cart total.

### Test Payment
- **Credit / Debit Cards**:
  - Valid: `4111111111111111` (any future MMYY, 3-digit CVV)
  - Declined: `4000000000000002`
- **UPI**: Any valid UPI format (e.g., `asha@okbank`, `reader@upi`)
- **Wallets**: Amazon Pay, Paytm, PhonePe

---

## 6. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start storefront in **mock mode** (MSW, port 5173) |
| `npm run dev:live` | Start storefront in **live mode** against Medusa backend |
| `npm run build` | Type-check and create production frontend bundle |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript checks across source and tests |
| `npm run lint` | Run ESLint checks on frontend |
| `npm run format` | Format codebase with Prettier |
| `npm run format:check` | Check formatting without writing (CI) |
| `npm test` | Run Vitest unit & integration tests (watch mode) |
| `npm run test:coverage` | Run unit tests once with coverage; fails below 90 % |
| `npm run test:ui` | Open Vitest interactive UI |
| `npm run test:e2e` | Run Playwright E2E tests in mock mode (desktop, mobile, tablet) |
| `npm run test:e2e:live` | Run every E2E spec against live Medusa (after `npm run db:reset`) |
| `npm run db:up` | Start PostgreSQL Docker container |
| `npm run db:down` | Stop PostgreSQL Docker container |
| `npm run db:reset` | Drop the database, re-seed it and rewrite `.env.live.local` (stop Medusa first) |
| `npm run live:env` | Write `.env.live.local` from the seeded database |
| `npm run backend:install` | Install backend dependencies |
| `npm run backend:migrate` | Run database migrations and seed script |
| `npm run backend:dev` | Start Medusa v2 development server (port 9100) |
| `npm run backend:test` | Run backend Jest unit tests |
| `npm run backend:typecheck` | Type-check the Medusa backend |
| `npm run backend:lint` | Run ESLint on Medusa backend code |

---

## 7. Continuous Integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`:

| Job | What it runs |
|---|---|
| Static checks | `typecheck`, `lint`, `format:check`, `build`, `backend:typecheck`, `backend:lint` |
| Unit tests + coverage | `test:coverage`: fails when statements, branches, functions or lines drop below **90 %** (report uploaded as an artifact) |
| Backend unit tests | `backend:test` |
| E2E (mock API) | `test:e2e` on desktop (Chromium), iPhone 12 and iPad Pro (WebKit) |
| E2E (live) | PostgreSQL service → `backend:migrate` → `live:env` → Medusa on :9100 → `test:e2e:live` |

Coverage excludes the MSW mock backend (`src/mocks/**`), test helpers, `main.tsx` and type-only files (see `vitest.config.ts`).
