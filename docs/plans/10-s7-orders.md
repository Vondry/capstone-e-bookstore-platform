# 10 — S7 My Orders (`/orders`)

## Goal
Build the order history screen so a customer can review **2 Order history**, use **Buy it again** per book and **Cancel within 48 h** (simulated cancellation request) per order.

## Wireframe reference
**File:** none — reuses S2 card (`docs/wireframes/01-home-catalogue.png`, horizontal `BookCard`) + S4 panel (`docs/wireframes/03-cart-checkout.png`, `bg-layer-1` panels with 16–24 px padding on the page background).

- Page title "My Orders" (28 px), like "Shopping Cart" in S4.
- Each order is one `bg-layer-1` panel (like the S4 cart items panel): a header row, then the books as horizontal `BookCard`s in a grid.

**Open questions** (decided here, documented as assumptions):
1. Header layout: "Order #1002" (20 px) · "Placed on Thu, 1 Oct 2026" · status tag · "2 items" · total (₹ with 2 decimals, like the S4 Grand Total). Decision: one row ≥ md that wraps on sm, separated from the books by a `border-border` divider.
2. Status tag style: no tag component exists. Decision: a small square tag in `bg-layer-2` with a 12 px label; "Cancellation requested" uses `text-support-error`.
3. Cancel button placement: right side of the header, with "You can cancel for another 45 h" helper text next to it.
4. Quantity: order lines may have quantity > 1; Buy it again always adds 1 (spec).
5. Guests: a login prompt panel (not a redirect), link to `/login?redirect=/orders`.

## Component tree
- `OrdersPage` (modify — `src/pages/OrdersPage.tsx`) — document title, auth gate
  - `PageContainer` (reuse)
  - `OrdersSkeleton` (new) — `Skeleton` (reuse)
  - `GuestPrompt` (new) — login link panel
  - `OrderHistory` (new) — `useOrders(enabled)`, states
    - `ErrorState` (reuse) / `EmptyState` (reuse, CTA to `/`)
    - `OrderPanel` (new) — `<section aria-labelledby>`
      - `OrderHeader` (new) — number, date, `OrderStatusTag` (new), item count, total
      - `CancelOrderButton` (new) — `Button` + `ConfirmDialog` (reuse), `useRequestCancellation`, `useToast`
      - `BookCard` (reuse) ×n
        - `BuyAgainButton` (new) — `Button` small secondary, `useAddToCart`, `useToast`

## Files
| Path | Action | Purpose |
|---|---|---|
| `docs/plans/10-s7-orders.md` | create | this plan |
| `src/pages/OrdersPage.tsx` (+ `.test.tsx`) | modify/create | page, document title, guest gate, integration tests |
| `src/features/orders/lib/cancelWindow.ts` (+ test) | create | `CANCEL_WINDOW_HOURS`, `canCancel`, `hoursLeftToCancel` |
| `src/features/orders/lib/orderFormat.ts` (+ test) | create | `formatOrderDate`, `formatItemCount`, `orderStatusLabel` |
| `src/features/orders/components/history/*.tsx` | create | components listed above |
| `src/features/orders/components/history/useNow.ts` | create | page clock (ticks every minute) so Cancel disappears at 48 h without a reload |

## Data
- `useCustomer()` → `null` for guests (auth domain, reuse).
- `useOrders(enabled)` → `fetchOrders()` → `GET /store/orders` (Medusa store orders: https://docs.medusajs.com/api/store#orders). Not called for guests.
- `useRequestCancellation()` → `POST /store/orders/:id/cancel-request` — **SIMULATED** (Medusa has no store-side cancel; mock enforces 48 h server-side). The UI says "Cancellation requested", never "Cancelled".
- `useAddToCart()` → `{ variantId: book.variantId }` (cart domain, reuse).
- Types: `Order`, `OrderLine`, `OrderStatus` from `features/orders/types.ts`.

## States
- Customer query: loading → skeleton; guest → `GuestPrompt`.
- Orders query: loading → skeleton panels; error → `ErrorState` with retry (`refetch`); empty → `EmptyState` "No orders yet" + "Browse the catalogue"; success → panels.
- Buy it again: button loading while pending; success toast "Added {title} to your cart"; error toast.
- Cancel: dialog confirm button loading; success → toast + status tag "Cancellation requested" (list refetched); error → error toast, status unchanged.

## Responsive behaviour
- sm: header items stack/wrap; book grid 1 column.
- md: book grid 2 columns; header one wrapping row.
- lg: unchanged (no sidebar on this page).
- xlg: book grid 3 columns (as S2).

## Accessibility
- `h1` "My Orders"; each order is `<section aria-labelledby>` with an `h2` "Order #1002".
- Buy it again buttons have an accessible name including the title (`aria-label="Buy {title} again"`).
- Cancel opens `ConfirmDialog` (alertdialog, focus moved to the safe choice, Escape closes, focus restored).
- Status changes and cart additions announced via the toast live region.

## Tests
- Unit (`cancelWindow.test.ts`, fake timers): inside window, exactly 48 h (not cancellable), after window, future `createdAt`, already requested, `hoursLeftToCancel` ceil + 0 when expired, default `now`.
- Unit (`orderFormat.test.ts`): date format, item count singular/plural, status labels.
- Page (`OrdersPage.test.tsx`, RTL + MSW): title; guest prompt (no orders call); newest first; Buy it again → cart line added + toast; Buy it again error toast; Cancel only on recent order with hours left; confirm → "Cancellation requested"; dismiss keeps status; advancing fake time past 48 h hides Cancel; empty state; error + retry.
- E2E: none in this task (golden path does not include S7).

## Risks & open questions
- Fake timers with MSW/React Query: use `vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })` so promises/`setTimeout` still run.
- Cancel button visibility uses a `useNow()` clock that ticks every minute; the server enforces the window anyway (400 → error toast). Tests fake `Date` + `setInterval` only.

## Task checklist
- [x] Write this plan
- [x] `cancelWindow.ts` + `orderFormat.ts` with 100 % branch tests
- [x] History components (panel, header, tag, buy again, cancel, guest, skeleton)
- [x] `OrdersPage` composition + document title
- [x] Page tests; typecheck, lint, test
