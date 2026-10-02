# 07 — S5 Payment (`/payment`)

## Goal
Build the payment screen so a customer can **10 Initiate payment** (choose Credit card / Debit card / UPI / Wallet and enter validated details) and reach **11 Payment confirmation** (cart completed, redirect to S6 `/orders/:id/success`).

## Wireframe reference
**File:** `docs/wireframes/04-payment.png` (1584 × 1073)

- Full-bleed illustrated background (books, shapes) under the 48 px header; no category sidebar.
- A centred dark panel (`--layer-1`, ≈ 650 px wide at 1584 px). Header row: "Complete Payment" (20 px, regular) left, "Payable Amount: ₹580" (bold) right.
- Left: vertical tabs "Credit Card" (selected: `--layer-1` with a 3 px left bar in `--interactive`, semibold), "Debit card", "UPI", "Wallet" (`--layer-2`, divided by 1 px lines).
- Right: 2 × 2 grid — Card Number (`XXXX-XXXX-XXXX-XXXX`), Name on Card (`Name`), CVV (`XXX`), Date of Expiry (`MM/YYYY`). "Pay Now" primary button bottom-right with a card icon.

**Open questions** (decided here, documented as assumptions):
1. "₹580" is placeholder copy — show the real `cart.totals.total` (2 decimals, like other totals).
2. UPI and Wallet panels are not drawn. Decision: UPI = one "UPI ID" input (`name@bank`); Wallet = a "Wallet" select (Paytm, PhonePe, Amazon Pay, Mobikwik) — same panel layout, Pay Now bottom-right.
3. Debit card uses the same fields as Credit card.
4. The 1584 px wireframe implies ≈ 650 px panel width; used `max-w-[650px]` (the "~490 px" brief came from the scaled copy).
5. Declined/failure path is not drawn. Decision: inline `role="alert"` notice above Pay Now, focused on failure.

## Component tree
- `PaymentPage` (modify — `src/pages/PaymentPage.tsx`)
  - `IllustratedBackground` (reuse)
  - `PaymentPanel` (new) — header row + tabs
    - `Tabs` (new, `components/ui`) — vertical ≥ md, horizontal scrollable < md
      - `CardPaymentForm` (new) — `TextInput` ×4 (reuse)
      - `UpiPaymentForm` (new) — `TextInput` (reuse)
      - `WalletPaymentForm` (new) — `Select` (reuse)
      - `PaymentFooter` (new) — `PaymentAlert` + `Button` "Pay Now" (reuse)
  - `PaymentSkeleton` (new) / `EmptyState` (reuse, no cart / no address) / `ErrorState` (reuse)

## Files
| Path | Action | Purpose |
|---|---|---|
| `docs/plans/07-s5-payment.md` | create | this plan |
| `src/pages/PaymentPage.tsx` (+ `.test.tsx`) | modify/create | states, document title, composition |
| `src/components/ui/Tabs.tsx` (+ test) | create | accessible tablist (tab/tabpanel, arrows/Home/End, orientation) |
| `src/features/payment/types.ts` | create | `CardDetails`, `UpiDetails`, `WalletDetails`, `PaymentSubmission`, `PaymentOutcome` |
| `src/features/payment/lib/luhn.ts` (+ test) | create | `passesLuhn(digits)` |
| `src/features/payment/lib/cardFormat.ts` (+ test) | create | `digitsOnly`, `formatCardNumber`, `formatExpiry`, `formatCvv` |
| `src/features/payment/lib/expiry.ts` (+ test) | create | `parseExpiry`, `isExpiryCurrent(value, now)` |
| `src/features/payment/lib/schemas.ts` (+ test) | create | Zod `cardSchema`, `upiSchema`, `walletSchema`, `WALLETS` |
| `src/features/payment/lib/simulateOutcome.ts` (+ test) | create | SIMULATED `simulatePaymentOutcome(submission)` |
| `src/features/payment/lib/methods.ts` | create | tab list (method → label) |
| `src/features/payment/hooks/usePayment.ts` | create | double-submit guard, simulate → `useCompleteCart` → navigate |
| `src/features/payment/hooks/useMediaQuery.ts` | create | `useSyncExternalStore` media query (tab orientation) |
| `src/features/payment/components/*.tsx` | create | components listed above |

## Data
- `useCart()` (reuse, `features/cart/hooks/useCart.ts`) → `Cart | null`: `totals.total`, `lines`, `shippingAddress`.
- `useCompleteCart()` (reuse) → `completeCart(paymentMethod)` → `POST /store/carts/:id/complete` (Medusa: https://docs.medusajs.com/api/store#carts_postcartsidcomplete; the SDK equivalent is `sdk.store.cart.complete`). **Only the method string is sent.**
- **SIMULATED:** payment authorisation — `simulatePaymentOutcome()` decides client-side. Test card `4000-0000-0000-0002` → "Your card was declined…" without any API call. Everything else proceeds to `completeCart`.
- Card number, CVV and expiry live only in React Hook Form state of the mounted form: never logged, persisted, put in the query cache/URL or sent.

## States
| Part | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Cart query | panel-shaped skeleton | no cart / no lines → "Your basket is empty" + link to `/checkout`; no address → "Add a delivery address first" + link | `ErrorState` + retry (`refetch`) | panel with amount + forms |
| Pay (mutation) | button "Processing payment…", disabled, `aria-busy` | — | inline alert (declined / API message), focused; CVV cleared | `navigate('/orders/:id/success', { replace: true })` |

## Responsive behaviour
- sm (< 672): panel full width (16 px gutters); tabs become a horizontal scrollable tab list above the form; fields 1 column; Pay Now full width.
- md+: vertical tabs left (≈ 168 px), 2 × 2 field grid, Pay Now right-aligned.
- lg / xlg: unchanged, panel stays centred at max 650 px.

## Accessibility
- `<main>` from the shell; panel is a `<section aria-labelledby>` with `<h1>` "Complete Payment".
- Tabs: `role=tablist` (`aria-label="Payment method"`, `aria-orientation`), `role=tab` with `aria-selected`, roving `tabIndex`, Arrow keys/Home/End; `role=tabpanel` labelled by the active tab.
- Visible labels, errors linked via `aria-describedby` (TextInput/Select), `autocomplete` `cc-number`, `cc-name`, `cc-csc`, `cc-exp`; `inputMode="numeric"`; CVV `type=password`.
- On failure the alert (`role=alert`, `tabIndex=-1`) receives focus. Title "Payment · Book Worm".

## Tests
- Unit: Luhn valid/invalid/edge; formatting (dashes, max length, expiry slash); expiry past/current/future month (fake timers); schemas per method; simulate outcome (declined vs approved, all methods).
- Tabs: roles, click selects, Arrow/Home/End keys move + wrap, horizontal/vertical orientation.
- Page (RTL + MSW): no cart, no address; Pay Now disabled until valid; keyboard tab switching; UPI validation; success navigates to success route; declined card → alert focused, name/number kept, CVV cleared, `/complete` not requested; double submit → one request; API error shows alert.
- E2E (golden path pay step) is covered by the shared Playwright suite — not in this task.

## Risks & open questions
- RHF `isValid` must update on change while `mode: 'onBlur'` (supported in RHF 7.89).
- Real Medusa needs a payment session (`sdk.store.payment.initiatePaymentSession`) before `complete`; `completeCart` in `features/cart/api.ts` is owned elsewhere — flagged as TODO.

## Task checklist
- [x] Pure libs + unit tests (luhn, cardFormat, expiry, schemas, simulateOutcome)
- [x] `Tabs` primitive + tests
- [x] `usePayment` + `useMediaQuery` hooks
- [x] Payment form components + panel
- [x] `PaymentPage` states + page tests
- [x] Typecheck, lint, tests
