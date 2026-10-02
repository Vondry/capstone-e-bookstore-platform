# 14 — Backend: Medusa v2 on PostgreSQL, wired up behind a mock/live switch

## 1. Goal
Deliver the backend half of the capstone deck (slide 15: PostgreSQL, a data model designed from the
wireframes, an OpenAPI spec, AI-augmented backend services, local deployment) and wire the existing
frontend to it, **without losing the MSW mocks**: mock mode stays the default for local development,
unit tests and E2E, and live mode talks to the real backend. Journey steps covered: all of 1–12, now
backed by real persistence (login, catalogue, basket, address, coupons, gift points, payment, orders,
Buy it again, cancel within 48 h, recommendations, brands, reviews).

## 2. Wireframe reference
No new screens. The data model is derived from the five wireframes (`docs/wireframes/01–05`), the
architecture diagram (`docs/architecture.png`, deck slide 6) and the domain model in
`.bob/rules/01-stack-and-architecture.md`.

Domains on the architecture diagram, and what this plan does with each:

| Domain | Diagram features | This plan |
|---|---|---|
| Member | Guest / registered users, login & logout, rate & endorsement | Medusa customer + emailpass auth; **Reviews** module (rate & endorse) |
| Store | Create stores, catalogs, store admins | Medusa store, sales channel, region "India" (INR), admin user (via Medusa Admin) |
| Catalog | Browse by category & brand, recommendations from order history, up-sell / cross-sell | Medusa products + categories; **Brands** module (writers, publishers); recommendations stay a pure frontend function over real orders; Related Reads = cross-sell |
| Order | Create / modify order, checkout, confirm, cancel, return, order history, redeem gift points, coupons | Medusa cart/order + promotions; **cancel-request** route (48 h); **Loyalty** module (gift points). Returns: out of scope (see Risks) |
| Payment | Gateway, refund, confirmation, gift & wallet | Medusa system payment provider (`pp_system_default`); card/UPI/wallet stay UI-only (SIMULATED, never sent) |
| Shipping | Rate calculation, approximate delivery time, return shipment | Medusa shipping option: ₹40, free from ₹499; eBooks need no shipping; delivery estimate stays client-side |

**Decisions (2026-10-01):**
- D1: Backend lives in **`backend/` in this repo** (one GitHub link, one PR).
- D2: **Reviews move to the backend**; the wishlist stays in the browser (SIMULATED).
- D3: Backend dependencies and `docker-compose.yml` are approved. Docker runs through **OrbStack** (plain `docker compose` CLI; no Docker Desktop).
- D4: Medusa runs on **port 9100** (configurable via `PORT`), because a local PHP-FPM already listens on 9000.

- D5 (Q4): add `@medusajs/types@2.21.2` as a dev dependency (typed SDK responses, compile-time contract).
- D6 (Q5): reviews need login and are **auto-approved** on create (admin can still reject); guests see "Log in to leave a review".
- D7 (Q6): try Node v24 for `backend/`; fall back to v22 only if the install fails.

## 3. Component tree
No UI components change. The change is in the data layer:

- `src/lib/medusa.ts` (new): the single `sdk` instance (rule 01)
- `src/main.tsx` (modify): start MSW only in mock mode
- `features/*/api.ts` (modify): call the SDK (or `sdk.client.fetch` for custom routes), return domain types
- `features/*/mappers.ts` (new): Medusa `HttpTypes.*` DTO → domain type (`Book`, `Cart`, `Order`, `Customer`)
- `src/mocks/handlers/*` (modify): return **Medusa DTO shapes**, so mock and live run the same `api.ts` + mappers
- `src/lib/http.ts` (delete at the end): replaced by the SDK

## 4. Files
| Path | Action | Purpose |
|---|---|---|
| `docs/data-model.md` | create | ERD (Mermaid) of Medusa core entities used + custom modules; field mapping from wireframes |
| `docs/api/openapi.yaml` | create | OpenAPI 3.1 for the **custom** store routes; core routes reference Medusa's published store API spec |
| `shared/catalog/*.json` | create | Single source of truth for seed data (books, writers, publishers, categories), used by both the MSW mock DB and the Medusa seed script |
| `src/lib/medusa.ts`, `src/lib/storeTypes.ts` | create | SDK client; custom-route DTOs and cart/order wire types |
| `src/features/{catalog,product,brands,cart,auth,orders}/mappers.ts` (+ tests) | create | DTO → domain mapping, unit-tested with DTO fixtures |
| `src/features/*/api.ts` | modify | Use the SDK; keep the same exported functions, so hooks and UI are untouched |
| `src/mocks/handlers/*.ts`, `src/mocks/db.ts` | modify | Emit `HttpTypes.Store*` DTOs (type-checked against the SDK types); read seed data from `shared/catalog` |
| `.env.example` | create | `VITE_API_MODE`, `VITE_MEDUSA_URL`, `VITE_MEDUSA_PUBLISHABLE_KEY`, `VITE_MEDUSA_REGION_ID` |
| `package.json` | modify | `dev` (mock), `dev:live`, `test:e2e:live` scripts |
| `docker-compose.yml` | create | PostgreSQL 16 (+ Redis if Medusa needs it) for local live mode |
| `backend/` | create | Medusa v2 app (`create-medusa-app`), see below |
| `backend/src/modules/brands/` | create | `writer`, `publisher` models + module links to `product` |
| `backend/src/modules/loyalty/` | create | `points_ledger` (customer_id, delta, reason, order_id); balance = sum |
| `backend/src/modules/product-review/` | create | `review` (product_id, customer_id?, first/last name, content ≤100, rating 1–5, status) (D2) |
| `backend/src/api/store/**/route.ts` | create | Custom routes (section 5) with Zod validation |
| `backend/src/subscribers/order-placed.ts` | create | Earn gift points (1 per ₹10) when an order is placed by a customer |
| `backend/src/scripts/seed.ts` | create | Region INR + 12 % tax, sales channel, publishable key, shipping, promotions, categories, books, writers/publishers, demo customer + orders |
| `backend/integration-tests/http/*.spec.ts` | create | Route tests with Medusa's test utilities against a test database |
| `playwright.config.ts` | modify | Optional `live` project (golden path only) against the seeded backend |
| `README.md` | create/modify | How to run mock mode, live mode and the tests |

## 5. Data
SDK methods below are confirmed in the installed `@medusajs/js-sdk` 2.21 typings
(`node_modules/@medusajs/js-sdk/dist/esm/store/index.d.ts`); behaviour still to be checked against
https://docs.medusajs.com/resources/js-sdk before each phase (rule 01).

**Core Medusa store API (no backend code needed)**

| Frontend function | Today (mock route) | Live |
|---|---|---|
| `fetchBooks(filters)` | `GET /store/products` | `sdk.store.product.list({ q, category_id, type_id, tag_id, region_id, fields, order })`. Format = product **type**, language = product **tag** (native filters; there is no metadata filter). Price range and price/bestseller sorting are applied on the client to the filtered list (26 books; see Risks) |
| `fetchBook(handle)` | `GET /store/products/:handle` | `sdk.store.product.list({ handle, region_id, fields })` → first |
| `fetchNewLaunches()` | `GET /store/products/new` | `sdk.store.product.list({ order: '-created_at', limit: 3 })` |
| writer / publisher of a book | (embedded in mock) | `fields: '+writer.*,+publisher.*'` on product requests, via module links |
| categories | static `lib/categories.ts` | `sdk.store.category.list()` (sidebar order stays static: wireframe order) |
| cart CRUD | `/store/carts…` | `sdk.store.cart.create({ region_id })`, `.retrieve`, `.update` (address, email, metadata), `.createLineItem`, `.updateLineItem`, `.deleteLineItem` |
| coupons | `POST/DELETE /store/carts/:id/promotions` | `sdk.store.cart.addPromotions` / `removePromotions` |
| shipping | (computed in mock) | `sdk.store.fulfillment.listCartOptions` + `sdk.store.cart.addShippingMethod` (skip when the cart is eBook-only) |
| place order | `POST /store/carts/:id/complete` | `sdk.store.payment.initiatePaymentSession(cart, { provider_id: 'pp_system_default' })` → `sdk.store.cart.complete` |
| login / register | `/auth/customer/emailpass(/register)` | `sdk.auth.login('customer', 'emailpass', …)`, `sdk.auth.register(…)` + `sdk.store.customer.create` |
| me | `GET /store/customers/me` | `sdk.store.customer.retrieve()` (+ saved address via `listAddress`) |
| orders | `GET /store/orders(/:id)` | `sdk.store.order.list` / `.retrieve` |

**Custom routes (documented in `docs/api/openapi.yaml`, called with `sdk.client.fetch`)**

| Route | Purpose | Notes |
|---|---|---|
| `GET /store/writers`, `/store/writers/:slug` | Brands: writers + their bio | Brands module (writer ↔ product link) |
| `GET /store/publishers`, `/store/publishers/:slug` | Brands: publishers | Brands module |
| `GET /store/catalog/bestsellers` | "Bestsellers this Month" | Returns ranked product ids (last 30 days of orders, fallback `metadata.sold_count`); the client loads them with `product.list({ id })`. Not under `/store/products/…` to avoid clashing with the core `GET /store/products/{id}` |
| `POST /store/orders/:id/cancel-request` | Cancel within 48 h | Owner only; 48 h enforced server-side; stores a request; status "Cancellation requested" (an admin cancels in Medusa Admin). Same rule as the current mock |
| `GET /store/customers/me/loyalty-points` | Gift points balance | Loyalty module ([Medusa tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/loyalty-points)) |
| `POST` / `DELETE /store/carts/:id/loyalty-points` | Redeem / stop redeeming | Single-use, customer-restricted promotion (tutorial pattern); our rates: earn 1 per ₹10, redeem 1 = ₹1, max 50 % of subtotal |
| `GET /store/products/:id/reviews`, `POST /store/reviews` | Rate & endorse | Reviews module ([Medusa tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/product-reviews)); creating needs login |

The full contract for these routes is **`docs/api/openapi.yaml`** (validated with Redocly). Entities and field mapping: **`docs/data-model.md`**.

**Stays on the frontend (SIMULATED, unchanged)**: delivery estimate, card/UPI/wallet validation
(no card data ever leaves the browser), recommendations (pure function over the customer's real
orders), wishlist (D2), sidebar order.

**Domain mapping** (rule 01): author, publisher, format, language, rating, sold count from
`product.metadata` (or the Brands link for author/publisher); categories from product categories;
price from the variant's calculated price in the INR region; cart totals from Medusa
(`subtotal`, `tax_total`, `shipping_total`, `discount_total`, `total`) mapped to `CartTotals`.
`computeTotals` remains the mock backend's maths and the optimistic-update helper.

## 6. States
No new UI states. Live mode adds failure modes the UI already handles: network errors and 5xx →
existing ErrorState + retry; 401 → treated as logged out; expired/unknown cart (404) → start a new
cart (already implemented in `fetchCart`). The mode switch must never show a blank page: if live
mode is misconfigured (missing URL/key), fail fast with a clear console error and the route error
boundary.

## 7. Responsive behaviour
Unchanged.

## 8. Accessibility
Unchanged.

## 9. Tests
- **Unit (Vitest)**: one test file per `mappers.ts`, using DTO fixtures; `apiMode` tests. The existing 345 tests keep running in mock mode and become the regression net for the refactor: they must stay green after each step.
- **Contract (compile time)**: MSW handlers are typed with `HttpTypes.Store*` response types, so a mock that drifts from Medusa's shapes fails `npm run typecheck`. This needs `@medusajs/types` (Q4). Custom-route DTOs are typed from one shared `types` file that the OpenAPI spec documents.
- **E2E (Playwright)**: the 57 tests keep running in mock mode (deterministic, no database, CI-friendly). A new `live` project runs the golden path against the seeded backend (`npm run test:e2e:live`), so the wiring is proven end to end.
- **Backend**: integration tests for each custom route (cancel-request 48 h window and ownership, points earn/redeem caps, brands lookups, bestsellers ranking) with Medusa's test utilities on a throwaway database.

## 10. Risks & open questions
- **Q4 `@medusajs/types` (new frontend dev dependency).** The SDK imports its response types from `@medusajs/types`, which is **not installed** (it's only a dev dependency of the SDK). With `skipLibCheck`, every SDK response is silently `any` today. Recommendation: add `@medusajs/types@2.21.2` (types only, same version as the SDK) as a dev dependency; without it the compile-time contract doesn't work.
- **Q5 review moderation.** Medusa's tutorial creates reviews as `pending` until an admin approves them, and requires login. Today any visitor's review appears at once. Recommendation: login required; auto-approve on create (the admin can still reject), so the S3 "Thanks! Your review has been added." flow stays. Guests see "Log in to leave a review".
- **Q6 Node version.** Medusa documents Node v20.19+ or v22.12+ (LTS); this machine has v24.21. Try v24 first; fall back to v22 (e.g. via `nvm`) for `backend/` only if the install fails.
- `AGENTS.md` still says the backend is a "separate repo/folder" at :9000; it needs a one-line update to `backend/` at :9100 (only with your OK — rule 6).

**Phase 3 findings (verified against the running Medusa 2.21.2):**
- **Tax is charged after discounts** (12 % of ₹408 for the ₹508 cart with BOOKWORM100), and `discount_total` includes the GST the discount saved (`discount_tax_total`). The frontend shows `discount_total − discount_tax_total` (₹100) and the mock now uses the same tax rule. (The wireframe's figures are illustrative; it doesn't show tax on the discounted amount either way.)
- **Coupons whose rules don't match are skipped silently** (200, not applied); unknown codes are 400 "The promotion code X is invalid". `applyCoupon` checks the result and shows the S4 message from the shared coupon rules; the mock mirrors both behaviours.
- **No tax until the cart has a country**: the region spans four countries, so carts are created with `shipping_address.country_code = 'in'`.
- **Order metadata isn't returned by the store API** (it is stored: the cart's `payment_method` is copied to the order). `Order.paymentMethod` is therefore optional, and the gift-points promotion is recognised by its `LOYALTY-` code, not by metadata.
- A registered e-mail answers 401 "Identity with email already exists" (handled in `auth/lib/errors.ts`).
- Guests can read an order by id (S6 works); the Admin API is protected.
- Local setup notes: Medusa runs on **9100** (`-p 9100` in its scripts; 9000 is PHP-FPM on this machine). The npm cache in `~/.npm` has root-owned files from an old `sudo npm`; fix with `sudo chown -R $(id -u):$(id -g) ~/.npm` (the scaffold used a temporary cache instead).

**Spike results (Phase 0, verified 2026-10-01 against the Medusa docs and the installed SDK 2.21 types):**
1. **Coupon minimum** — supported: promotion rule `item_subtotal gte 300` ([promotion concepts](https://docs.medusajs.com/resources/commerce-modules/promotion/concepts)). Numeric rules can't be made in the Admin UI, so the seed script creates them.
2. **Gift points** — follow Medusa's [loyalty points tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/loyalty-points): `loyalty_point` model, `order.placed` subscriber, single-use customer-restricted promotion stored in `cart.metadata.loyalty_promo_id`. Adapt its rates (it earns 1 point per currency unit; we earn 1 per ₹10 and cap redemption at 50 %).
3. **Catalogue filters** — `GET /store/products` supports `q`, `handle`, `id`, `category_id`, `type_id`, `tag_id`, `collection_id`, `order`, `fields`, `region_id`; **no metadata, price filter or price sort** (from `StoreProductListParams` in `@medusajs/types` 2.21.2). Format → product type, language → product tag; price range and price/bestseller sorting run on the client over the filtered result. Fine for 26 books; a real catalogue would need a custom search route (or Medusa's Index module).
4. **Free delivery from ₹499** — shipping option conditional price on `item_total` ([shipping option](https://docs.medusajs.com/resources/commerce-modules/fulfillment/shipping-option)). **Conflict found in Phase 2:** `item_total` is after discounts (and includes tax), but wireframe 03 gives free delivery to the ₹508 cart with a ₹100 coupon (threshold on the pre-discount subtotal). The mock keeps the wireframe rule. Phase 3 task: verify a pre-discount rule attribute (e.g. `original_item_total`) or implement a calculated-price fulfillment provider.
5. **eBook-only carts** — a product without a shipping profile needs no shipping ([selling products](https://docs.medusajs.com/resources/commerce-modules/product/selling-products)); eBooks get none.
6. **Auth** — SDK default `auth: { type: 'jwt' }`, token in `localStorage`; `sdk.auth.login` returns the token string on success; `sdk.auth.logout()` clears it ([JS SDK auth](https://docs.medusajs.com/resources/js-sdk/auth/overview)). Register = `sdk.auth.register('customer','emailpass', …)` then `sdk.store.customer.create(…)`; confirm the exact sequence in Phase 2.
7. **Install** — `npx create-medusa-app@latest backend --skip-db --no-browser` (flags from the [create-medusa-app reference](https://docs.medusajs.com/resources/create-medusa-app)), then point `DATABASE_URL` at the compose PostgreSQL and run migrations. Admin UI at `/app`. Redis is not required locally.
- **Returns / refunds / return shipment** (on the diagram) are out of scope for the storefront journeys; they exist in Medusa Admin and can be demoed there.
- **Seed data drift**: solved by `shared/catalog` feeding both the mock DB and the Medusa seed.
- **Time**: Phases 1–2 are frontend-only and safe; the backend phases depend on a local PostgreSQL (Docker).

## 11. Task checklist
**Phase 0 — decisions and spikes**
- [x] Decide repo layout, reviews, dependencies (D1–D4)
- [x] Run spikes 1–7 against the Medusa docs; findings recorded in section 10
- [x] Answer Q4–Q6 (D5–D7)

**Phase 1 — contract (deck: data model, OpenAPI)**
- [x] `docs/data-model.md` with the ERD and the wireframe → field mapping
- [x] `docs/api/openapi.yaml` for the custom routes (Redocly: valid)
- [x] Move seed data to `shared/catalog/*.json` (+ `artwork.ts`, typed `index.ts`); mock DB reads it

**Phase 2 — frontend data layer, mock mode only (no backend needed)**
- [x] `src/lib/medusa.ts`, `.env.example`; `main.tsx` starts MSW unless `VITE_API_MODE=live` (a live build contains no mock code)
- [x] Catalog + product: MSW returns `StoreProduct` DTOs; `mappers.ts` + tests; `api.ts` uses the SDK
- [x] Brands: custom-route client via `sdk.client.fetch` (writer/publisher detail return `product_ids`)
- [x] Cart + checkout: cart DTOs, promotions, shipping method, gift points route, payment session + complete
- [x] Auth + customer: SDK auth (register → create customer → login), me, addresses, loyalty balance
- [x] Orders: order DTOs; cancel-request via the custom route
- [x] Delete `src/lib/http.ts`; all unit and E2E tests green in mock mode
- [x] Reviews: product reviews through the custom routes (D6: login required, auto-approved) — moved to Phase 4 with the module, since it changes the S3 UI

**Phase 3 — backend scaffold (deck: PostgreSQL, local deployment)**
- [x] `docker-compose.yml` (PostgreSQL 16, host port 5433); `create-medusa-app@2.21.2` in `backend/` — it generates a Turborepo: the Medusa app is **`backend/apps/backend`** (paths in this plan that say `backend/src/…` mean `backend/apps/backend/src/…`)
- [x] Seed (`src/migration-scripts/bookworm-seed.ts`, runs once on `medusa db:migrate`): store (INR), region India + NP/BT/LK, 12 % GST, sales channel + publishable key, warehouse, "Standard delivery", BOOKWORM100 (min ₹300 rule) / READMORE10, 23 categories, 3 types, 2 language tags, 24 books from `shared/catalog`, demo customer + saved address
- [x] Free delivery from ₹499 **before discounts** (wireframe 03): calculated shipping option priced by a small fulfillment provider (`src/modules/bookworm-delivery`) + a `setCalculatedShippingPricingContext` hook that passes `item_subtotal`; delivery GST-exempt via a 0 % tax-rate rule. Flat price rules can't do it: adding a shipping method prices flat options without `item_subtotal` (verified live)
- [x] Smoke-tested against the running backend (store API): catalogue, filters, prices, coupons, delivery before/after the threshold and with a coupon, GST, guest checkout to an order, eBook-only carts, login, saved address
- [x] Backend unit tests (`npm run backend:test`), Medusa lint clean (`npm run backend:lint`)
- [x] Demo orders #1001/#1002 → Phase 4 (they need the Cancellation module for the 48 h flow)

**Phase 4 — custom backend services (deck: AI-augmented backend services)**
- [x] Brands module + routes + tests
- [x] Bestsellers route + test
- [x] Cancel-request route (48 h) + tests
- [x] Loyalty module: points ledger, order-placed subscriber, balance + redeem routes + tests
- [x] Reviews module + routes + tests (moderation per Q5)

**Phase 5 — wire up live mode**
- [x] `npm run dev:live` against the local backend; fix mapping gaps
- [x] Playwright `live` project: golden path passes against the seeded backend
- [x] README: mock vs live, env vars, how to seed

**Phase 6 — capstone wrap-up**
- [x] `docs/AI_WORKFLOW.md` entries for each phase (what Bob generated, what was changed and why)

