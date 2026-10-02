# AI-Assisted Development Log — Book Worm

How IBM Bob was used to build this project: what I asked, what it produced, what I kept,
what I changed and why.

## Setup
- **Agentic IDE:** IBM Bob. Modes used: Plan, Agent, Ask, plus a custom **UI Reviewer** mode (`.bob/custom_modes.yaml`).
- **Context engineering:**
  - `AGENTS.md`: project overview and working agreement
  - `.bob/rules/01–06`: architecture, design tokens, screen specs, code quality, testing, git
  - `.bob/rules-plan/`: plan format
  - `.bob/commands/`: `/screen`, `/responsive-check`, `/log-step`
- **Inputs:** wireframes in `docs/wireframes/`, architecture in `docs/architecture.png`.
- **Loop per screen:** `/screen` (Plan) → review the plan → Agent implements → verify (typecheck/lint/tests) → UI Reviewer → fix → `/responsive-check` → commit → `/log-step`.

## Summary
| Metric | Value |
|---|---|
| Screens built | 7 core screens (S1 Auth, S2 Home/Catalogue, S3 Product Detail, S4 Cart/Checkout, S5 Payment, S6 Purchase Success, S7 Orders) + Brands (Writers & Publishers) + Wishlist |
| Components generated / kept / rewritten | ~45 components generated / ~40 kept / ~5 adapted for live Medusa DTOs and reviews |
| Tests (unit / e2e) | 464 total tests: 374 frontend unit/integration tests (Vitest), 31 backend unit tests (Jest), 57 mock E2E tests (Playwright), 2 live golden path E2E tests (Playwright) |
| Notable AI mistakes caught | CORS origin missing port 5174 for live E2E runner; order sequence starting at 1001 instead of 1002 in seed script; hardcoded order #1003 in shared database E2E test; pre-discount free shipping threshold requiring custom fulfillment provider rather than flat pricing rules; missing `@medusajs/types` dependency causing implicit `any` in SDK responses |
| Estimated time saved | ~65–70% development time reduction (rapid Medusa v2 scaffolding, automated mapper generation, complete test suites and mock infrastructure generated and refined in hours) |

## Log
<!-- Entries appended by /log-step -->

### 13 — E2E Test Suite Implementation (2026-10-01)
- **Mode:** Code
- **Prompt (short):** "review the plan 13-e2e-tests.md" followed by "implement"
- **Context given:** Plan 13 (`docs/plans/13-e2e-tests.md`), all project rules (01-06), `AGENTS.md`
- **What Bob produced:**
  - Complete test infrastructure: fixtures (`test-data.ts`, `auth.ts`), base page object class
  - 8 page objects: `HomePage`, `ProductPage`, `CheckoutPage`, `PaymentPage`, `OrderSuccessPage`, `OrdersPage`, `WishlistPage`, `BasePage`
  - 8 test spec files covering:
    - `golden-path.spec.ts`: Guest and authenticated checkout flows with edge cases
    - `responsive.spec.ts`: Tests at 3 breakpoints (375×812, 768×1024, 1440×900) with screenshots
    - `auth.spec.ts`: Registration, login, logout, validation, protected routes
    - `wishlist.spec.ts`: Add/remove items, add to cart, empty state, guest handling
    - `orders.spec.ts`: Order history, 48h cancel window (with fake timers), buy again
    - `browsing.spec.ts`: Category navigation, filters, search, sorting, related reads
    - `accessibility.spec.ts`: Keyboard navigation, ARIA, focus management, contrast, motion
    - `edge-cases.spec.ts`: Validation, payment errors, network issues, data limits
  - All files use TypeScript strict mode, Page Object Model pattern, and follow Playwright best practices
- **What I changed / rejected and why:**
  - Maintained accessibility-first locators (`getByRole`, `getByLabel`) per `.bob/rules/05-testing.md`.
- **Verification:**
  - `npm run typecheck`: ✅ Pass
  - `npm run lint`: ✅ Pass
  - `npm test -- --run`: ✅ 335/335 tests passed

---

### 14 — Backend: Medusa v2 on PostgreSQL (Plan 14)

#### Phase 0 — Decisions & Spikes (2026-10-01)
- **Mode:** Plan / Architect
- **Goal:** Resolve open technical questions (Q4–Q6), validate feasibility against Medusa v2.21 docs and SDK types, and lay down core decisions (D1–D7).
- **Context given:** Capstone deck requirements (slide 15: Medusa v2, PostgreSQL, custom services, OpenAPI), `AGENTS.md`.
- **What Bob produced:**
  - Spike analysis on coupon minimum rules, gift points tutorial pattern, catalogue filtering capabilities, free delivery shipping calculation, auth flows, and `create-medusa-app` flags.
  - Decision record: D1 (in-repo `backend/` Turborepo structure), D2 (reviews backed by database; wishlist simulated client-side), D3 (Docker Compose with PostgreSQL 16 on port 5433 via OrbStack), D4 (backend on port 9100 to avoid host PHP-FPM collision on 9000), D5 (install `@medusajs/types@2.21.2` for strict compile-time contracts), D6 (review moderation: login required, auto-approved on creation), D7 (Node v24 runtime support).
- **What I changed / rejected and why:**
  - Rejected storing wishlist on Medusa backend to keep scope focused on commerce journeys (Member, Store, Catalog, Order, Payment, Shipping).
  - Adopted port 9100 explicitly because host machine port 9000 was occupied by local PHP-FPM.
  - Added `@medusajs/types` as dev dependency because `@medusajs/js-sdk` did not bundle types natively, preventing silent `any` leakage.

#### Phase 1 — Contract: Data Model, OpenAPI & Shared Catalog (2026-10-01)
- **Mode:** Code
- **Goal:** Formalize API and data contracts before writing backend or frontend integration code.
- **Context given:** Wireframes 01–05, `docs/architecture.png`, `.bob/rules/01-stack-and-architecture.md`.
- **What Bob produced:**
  - `docs/data-model.md`: Full Mermaid Entity-Relationship Diagram (ERD) detailing core Medusa models (`StoreProduct`, `StoreCart`, `StoreOrder`, `Customer`, `Promotion`) and custom models (`writer`, `publisher`, `points_ledger`, `review`, `cancellation_request`).
  - `docs/api/openapi.yaml`: OpenAPI 3.1 specification for custom store routes (`/store/writers`, `/store/publishers`, `/store/catalog/bestsellers`, `/store/orders/:id/cancel-request`, `/store/customers/me/loyalty-points`, `/store/carts/:id/loyalty-points`, `/store/reviews`). Validated with Redocly CLI.
  - `shared/catalog/`: Centralized single source of truth for seed data (`books.json`, `writers.json`, `publishers.json`, `categories.json`, `artwork.ts`, `index.ts`), shared between frontend MSW mock DB and Medusa database seed script.
- **What I changed / rejected and why:**
  - Ensured custom routes avoid colliding with Medusa's native parameter routes (e.g. `/store/catalog/bestsellers` rather than `/store/products/bestsellers` to avoid path conflicts with `/store/products/:id`).
  - Separated SVG artwork generators into shared code so both mock and live catalog have identical covers and author avatars.

#### Phase 2 — Frontend Data Layer & SDK Integration (2026-10-01)
- **Mode:** Code
- **Goal:** Refactor frontend data fetching to use `@medusajs/js-sdk`, keep MSW mocks running in Medusa DTO shapes, and maintain 100% green tests in mock mode.
- **Context given:** Plan 14, `.bob/rules/01-stack-and-architecture.md`, `shared/catalog/`.
- **What Bob produced:**
  - `src/lib/medusa.ts`: Medusa SDK client instance configured with JWT storage key `bw.token`.
  - `src/lib/storeTypes.ts`: TypeScript DTO definitions for custom routes and Medusa response envelopes.
  - `src/main.tsx`: Runtime mode switch to bypass MSW only when `VITE_API_MODE === 'live'`.
  - Mappers with unit test suites: `src/features/{catalog,product,brands,cart,auth,orders}/mappers.ts` mapping Medusa backend DTOs to clean domain models.
  - Refactored `src/features/*/api.ts` to call `sdk.store.*` and `sdk.client.fetch`.
  - Updated MSW handlers in `src/mocks/handlers/` and mock database in `src/mocks/db.ts` to emit Medusa DTO structures.
  - Deleted legacy `src/lib/http.ts`.
- **What I changed / rejected and why:**
  - Kept UI components and custom hooks completely decoupled from Medusa DTOs by using strict mapper functions.
  - Maintained optimistic cart updates and local fallback for smooth user experience.
- **Verification:**
  - All 374 frontend unit tests green.
  - All 57 mock Playwright E2E tests green.

#### Phase 3 — Backend Scaffold & Deployment (2026-10-01)
- **Mode:** Code
- **Goal:** Scaffold local PostgreSQL with Docker and Medusa v2 Turborepo backend, implement custom fulfillment provider, and build comprehensive database seed script.
- **Context given:** Plan 14, `docker-compose.yml`, Medusa 2.21 documentation.
- **What Bob produced:**
  - `docker-compose.yml`: PostgreSQL 16 container (`bookworm-postgres`) on host port 5433 with healthchecks.
  - `backend/`: Medusa v2.21 Turborepo application (`backend/apps/backend`).
  - `src/modules/bookworm-delivery`: Custom fulfillment provider calculating ₹40 standard shipping and implementing the free delivery threshold (subtotal ≥ ₹499 before discounts per Wireframe 03) with 0% GST exemption.
  - `src/migration-scripts/bookworm-seed.ts`: Comprehensive seed script creating India region (INR), 12% GST tax rate, store sales channel, publishable API key, promotions (`BOOKWORM100` with ₹300 minimum, `READMORE10`), 23 categories, 3 product types, language tags, and 24 books from `shared/catalog`.
  - Added root scripts in `package.json`: `db:up`, `db:down`, `backend:install`, `backend:migrate`, `backend:dev`, `backend:test`, `backend:lint`.
- **What I changed / rejected and why:**
  - Discovered that Medusa's standard flat shipping rules cannot inspect pre-discount subtotal during checkout; implemented `bookworm-delivery` custom fulfillment module with a `setCalculatedShippingPricingContext` hook to accurately enforce the wireframe requirement.
  - Configured PostgreSQL on host port 5433 to avoid clashing with standard PostgreSQL installations on port 5432.

#### Phase 4 — Custom Backend Services (2026-10-01)
- **Mode:** Code
- **Goal:** Implement the custom Medusa modules for Brands, Cancellation, Loyalty, Product Reviews, and Bestsellers ranking, with unit tests and frontend review integration.
- **Context given:** Plan 14, `docs/api/openapi.yaml`, `docs/data-model.md`, Capstone presentation deck.
- **What Bob produced:**
  - Synchronized `backend/apps/backend/src/lib/artwork.ts` with `shared/catalog/artwork.ts` to satisfy `sharedCopies.test.ts`.
  - Custom Medusa modules and routes:
    - **Brands Module**: Writer and publisher models, links to products, listing and detail endpoints.
    - **Bestsellers Route**: `GET /store/catalog/bestsellers` ranking products by 30-day order volume and fallback `sold_count`.
    - **Cancellation Module**: `cancellation_request` entity, `POST /store/orders/:id/cancel-request` enforcing the 48-hour cancellation policy.
    - **Loyalty Module**: `loyalty_point` ledger, balance check, cart redemption route (`POST /store/carts/:id/loyalty-points`), and `order.placed` subscriber rewarding 1 point per ₹10.
    - **Product Review Module**: Customer reviews data model, schema validation, auto-approval on creation, and `/store/products/:id/reviews` endpoints.
  - Comprehensive Jest unit tests (31 passing tests across 6 test suites):
    - `src/modules/brands/__tests__/brands.unit.spec.ts`
    - `src/modules/cancellation/__tests__/cancellation.unit.spec.ts`
    - `src/modules/loyalty/__tests__/loyalty.unit.spec.ts`
    - `src/modules/product-review/__tests__/review.unit.spec.ts`
    - `src/api/store/catalog/bestsellers/__tests__/bestsellers.unit.spec.ts`
    - `src/modules/bookworm-delivery/__tests__/service.unit.spec.ts`
  - Seed script additions:
    - 24 writers, 6 publishers, and product links.
    - Demo customer's 120 gift points.
    - Demo reviews.
    - Demo orders #1001 (240h ago) and #1002 (2h ago).
  - Frontend reviews wiring:
    - Added `ReviewDTO` and response shapes to `src/lib/storeTypes.ts`.
    - Added MSW handlers in `src/mocks/handlers/reviews.ts`.
    - Implemented `fetchReviews` and `submitReview` in `src/features/product/api.ts` with test coverage in `api.test.ts`.
    - Updated `useReviews.ts`, `ReviewsSection.tsx`, and `ProductPage.tsx`.
- **What I changed / rejected and why:**
  - Resolved prettier/formatting differences in `artwork.ts` to pass strict equality tests in `sharedCopies.test.ts`.
  - Seeded demo orders directly via Medusa workflows and updated timestamps to simulate historical orders.
- **Verification:**
  - `npm run typecheck`: ✅ Pass (0 errors)
  - `npm run lint`: ✅ Pass (0 errors)
  - `npm test -- --run`: ✅ 374/374 passed (56 test files)
  - `npm run backend:test`: ✅ 31/31 passed (6 test suites)
  - `npm run backend:lint`: ✅ Clean (0 lint issues)

#### Phase 5 — Wire up Live Mode (2026-10-01)
- **Mode:** Code
- **Goal:** Connect storefront to running Medusa v2 backend on port 9100, configure live E2E golden path, document mock vs live mode in README.
- **Context given:** Plan 14, `AGENTS.md`, `.bob/rules/05-testing.md`.
- **What Bob produced:**
  - `.env.live` with live Medusa credentials (`VITE_API_MODE=live`, `VITE_MEDUSA_URL=http://localhost:9100`, seeded publishable key, and region id).
  - Added scripts `"dev:live": "vite --mode live"` and `"test:e2e:live": "playwright test --project=live"` in `package.json`.
  - Configured `live` project and conditional web server in `playwright.config.ts`:
    - Live E2E tests run against a dedicated web server on port 5174 (`npm run dev:live -- --port 5174 --strictPort`) with serial execution (`workers: 1`, `fullyParallel: false`).
    - Mock tests on port 5173 continue running deterministically (57 tests).
  - Updated backend `.env` and `.env.template` to include `http://localhost:5174` in `STORE_CORS`, `ADMIN_CORS`, and `AUTH_CORS`.
  - Updated `backend/apps/backend/src/migration-scripts/bookworm-seed.ts` to ensure `order_display_id_seq` is set to 1002 so subsequent orders start deterministically at 1003.
  - Updated `tests/e2e/golden-path.spec.ts` to dynamically verify the newly placed order number in Test 2 on `/orders`, allowing both mock mode (#1003) and shared live database (#1004) to pass cleanly.
  - Created comprehensive `README.md` covering architecture, stack, mock vs live mode, environment variables, local setup, demo data, scripts, and verification matrix.
  - Checked off all Phase 5 items in `docs/plans/14-backend-medusa.md`.
- **What I changed / rejected and why:**
  - AI caught missing CORS permission for port 5174: during the initial live E2E run, Vite on port 5174 was blocked by backend CORS (`STORE_CORS` only allowed 5173). Added 5174 to CORS config and restarted Medusa.
  - AI caught order sequence collision: in `bookworm-seed.ts`, the demo orders left sequence at 1001, causing the next order to receive 1002. Added `SELECT setval('order_display_id_seq', 1002, true)` so new orders deterministically start at 1003.
  - AI caught parallel database race in golden-path: Test 2 hardcoded `#1003`, but on a shared database Test 1 placed #1003 and Test 2 placed #1004. Updated assertion to `name: orderNumber` to test the true domain invariant.
- **Verification:**
  - `npm run test:e2e:live`: ✅ 2/2 passed (golden path against live Medusa & PostgreSQL)
  - `npm run test:e2e`: ✅ 57/57 passed (mock mode across chromium, mobile, tablet)
  - `npm run typecheck`: ✅ Pass (0 errors)
  - `npm run lint`: ✅ Pass (0 errors)
  - `npm test -- --run`: ✅ 374/374 passed across 56 test files
  - `npm run backend:test`: ✅ 31/31 passed across 6 test suites
  - `npm run backend:lint`: ✅ Clean (0 lint issues)

#### Phase 6 — Capstone Wrap-up (2026-10-01)
- **Mode:** Ask / Documentation
- **Goal:** Document the full AI workflow log covering all phases, catalog what Bob generated, what was changed/adapted and why, and record final project metrics.
- **Context given:** Plan 14, `docs/AI_WORKFLOW.md`, `AGENTS.md`.
- **What Bob produced:**
  - Comprehensive, chronological AI workflow log in `docs/AI_WORKFLOW.md` detailing all decisions, code generations, architectural trade-offs, bug fixes, and verification outcomes across Phases 0 through 6.
  - Summary metrics table capturing screens built, component counts, test counts, notable AI mistakes caught, and time saved.
  - Verified that all documentation links and references accurately match the delivered codebase.
- **Status:** Complete. Capstone deliverables fully satisfied and verified.