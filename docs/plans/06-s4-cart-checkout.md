# 06 — S4 Shopping cart + checkout (`/checkout`)

## Goal
Build the single-page cart + checkout screen so a customer can review the **8 Basket** (change quantities, remove items), enter the **9 Delivery address**, apply a coupon, redeem gift points and continue to payment.

## Wireframe reference
**File:** `docs/wireframes/03-cart-checkout.png`

- Breadcrumb "Home / Non-Fiction / Self Help / Joy of Minimalism / Checkout"; title "Shopping Cart".
- Cart panel (`layer-1`): horizontal book cards side by side (cover, title, author link, description, format, category links, price, delivery date) with a quantity stepper "1 | − | +" under each (bottom border like an input).
- "Address" panel (left, ~60 %): "Use Saved Address" checkbox, then a 4-column grid: First Name, Last Name, Address (2 cols) / e-mail (2 cols), City, Pin (placeholder 000000) / Phone Number (+91 select + number, 2 cols), State, Country (select, India).
- "Grand Total" panel (right): book illustration left; rows Price (2 items) ₹508.00, Tax ₹62.00, Delivery Charges Free; divider; "Apply Coupon" input + "Apply"; Discount ₹100; divider; **Total Amount** ₹470; **Pay Now** (primary, icon right).

**Open questions** (decided here, documented as assumptions):
1. Breadcrumb trail: derived from the first cart line — Home → its categories (`/category/:handle`) → book (`/books/:handle`) → "Checkout". An empty cart shows "Home / Checkout".
2. Gift points are not on the wireframe; the spec asks for a **Redeem gift points** toggle + "Available: N points". Placed between the coupon and Discount rows. Guests see "Log in to redeem gift points" with a link to `/login`.
3. Points redeemed show as their own "Gift points" row (only when > 0) so the Discount row keeps meaning "coupon". Discounts are shown with a minus sign ("−₹100.00").
4. The coupon input needs a visible label (02 accessibility rule): label "Coupon code", placeholder "Apply Coupon".
5. Phone: the wireframe shows a single "Phone Number" label; the code select gets its own visible label "Code". Phone is always 10 digits, whatever the code (SIMULATED, India-first store).
6. Country options: India (default), Nepal, Bhutan, Sri Lanka; codes +91, +977, +975, +94.
7. Max quantity per line: 10 (no stock data in the mocks).
8. Unchecking "Use Saved Address" restores the values the form started with (cart address or empty).

## Component tree
- `CheckoutPage` (modify — `src/pages/CheckoutPage.tsx`) — title, states
  - `PageContainer` (reuse), `Breadcrumb` (reuse)
  - `CheckoutSkeleton` (new) / `ErrorState` (reuse) / `EmptyState` (reuse)
  - `CheckoutContent` (new)
    - `CartItems` (new) — `BookCard` (reuse) + `QuantityStepper` (new, `components/ui`) per line, `ConfirmDialog` (reuse)
    - `AddressForm` (new) — `Checkbox` (new, `components/ui`), `TextInput` (reuse), `Select` (reuse), `PhoneField` (new)
    - `GrandTotalPanel` (new) — `BookIllustration` (reuse), `TotalsRow` (new)
      - `CouponField` (new) — `TextInput`, `Button`
      - `GiftPointsToggle` (new) — `Toggle` (new, `components/ui`)
      - Pay Now `Button` (reuse) — submits the address form via `form="checkout-address"`

## Files
| Path | Action | Purpose |
|---|---|---|
| `docs/plans/06-s4-cart-checkout.md` | create | this plan |
| `src/pages/CheckoutPage.tsx` (+ `.test.tsx`) | modify/create | page composition, states, document title |
| `src/features/checkout/lib/schemas.ts` (+ test) | create | `addressSchema` (Zod) → `Address`, select options, `emptyAddress` |
| `src/features/checkout/lib/breadcrumb.ts` (+ test) | create | `buildCheckoutBreadcrumb(cart)` |
| `src/features/checkout/hooks/useCheckoutForm.ts` | create | RHF setup, saved-address toggle, Pay Now submit |
| `src/features/checkout/components/*.tsx` | create | components listed above |
| `src/components/ui/QuantityStepper.tsx` (+ test) | create | −/value/+ stepper |
| `src/components/ui/Checkbox.tsx` (+ test) | create | labelled native checkbox, 48 px target |
| `src/components/ui/Toggle.tsx` (+ test) | create | `role="switch"` toggle |

## Data
- `useCart()` → `GET /store/carts/:id`. Totals come computed from the server (`cart.totals`). Medusa: https://docs.medusajs.com/api/store#carts_getcartsid
- `useUpdateLineQuantity()` (optimistic) → `POST /store/carts/:id/line-items/:lineId`; `useRemoveLine()` → `DELETE …/line-items/:lineId`. https://docs.medusajs.com/api/store#carts_postcartsidlineitemslineitem_id
- `useApplyCoupon()` / `useRemoveCoupon()` → `POST|DELETE /store/carts/:id/promotions` (**SIMULATED** coupon catalogue in `totals.ts`). https://docs.medusajs.com/api/store#carts_postcartsidpromotions
- `useUpdateCart()` → `POST /store/carts/:id` with `shipping_address` (Pay Now) and `metadata.redeem_points` (**SIMULATED** gift points). https://docs.medusajs.com/api/store#carts_postcartsid
- `useCustomer()` → saved address + gift points balance (**SIMULATED** points).
- Types: `Cart`, `CartLine` (cart), `Address`, `CartTotals` (checkout), `Customer` (auth).

## States
| Part | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Cart | `CheckoutSkeleton` (cards + two panels) | `EmptyState` "Your cart is empty" + "Browse books" CTA → `/` | `ErrorState` + retry | full page |
| Quantity change | optimistic value | qty 0 → confirm dialog | rollback + error toast | new totals |
| Remove | confirm button `loading` | — | error toast, dialog stays | toast "Removed …" |
| Coupon | Apply `loading` | — | API message inline under the input | "BOOKWORM100 applied" + Remove |
| Gift points | toggle disabled while saving | 0 points → disabled | error toast | totals updated |
| Pay Now | button `loading`/disabled | — | inline field errors / error toast | navigate `/payment` |

## Responsive behaviour
- **sm (<672)**: one column; cart cards stacked; address fields one per row; Grand Total below the form, illustration hidden.
- **md (≥672)**: cart cards 2 per row; address grid 4 columns (wide fields span 2); illustration shown beside the totals.
- **lg (≥1056)**: Address (3fr) and Grand Total (2fr) side by side; Grand Total sticky under the header; address grid 2 columns (it is narrower now).
- **xlg (≥1312)**: cart cards 3 per row; address grid back to 4 columns like the wireframe.
- No horizontal scroll at 320 px; every control ≥ 44 px tall.

## Accessibility
- One `h1` "Shopping Cart"; `h2` "Your items" (visually hidden), "Address", "Grand Total". Grand Total is an `aside` labelled by its heading.
- Stepper: `role="group"` named "Quantity for {title}", buttons "Decrease/Increase quantity of {title}", value in `aria-live="polite"`.
- Remove confirmation: `ConfirmDialog` (alertdialog, focus on Cancel, Escape closes, focus returns).
- Every field has a visible label; errors linked with `aria-describedby` + `aria-invalid`; first invalid field focused on Pay Now.
- Checkbox native; Toggle `role="switch"` + `aria-checked`; coupon error `role="alert"`.
- Keyboard path: steppers → saved address → fields → coupon → points → Pay Now (Pay Now is a submit button bound to the form with `form=`).

## Tests
- Unit: `schemas.ts` (valid, required, e-mail, pin 6 digits, phone 10 digits, unknown country); `breadcrumb.ts` (with lines, empty).
- Component: `QuantityStepper` (+/−, min/max disabled, group label), `Checkbox` (label, toggle, keyboard space), `Toggle` (switch role, aria-checked, click/keyboard).
- Page (RTL + MSW): renders lines + totals; + increases quantity; − at 1 asks for confirmation → Remove removes; Cancel keeps item; coupon success shows applied code + discount; invalid coupon shows API message; gift points toggle (logged in) updates the total; guest sees the login hint; Use Saved Address prefills; Pay Now invalid → errors, no navigation; valid → saves address and navigates to `/payment`; empty cart state; a failing cart route falls back to the empty state (`fetchCart` swallows errors, so `ErrorState` is only reachable once cart/api.ts rethrows non-404 errors).
- E2E: covered by the shared golden path; no new spec in this task.

## Risks & open questions
- Other agents work in the same folder: only S4-owned files are touched.
- Rapid stepper clicks send one request each; the optimistic update keeps the UI consistent but requests are not debounced.
- Coupon codes and gift points are simulated; real Medusa promotions differ (codes are not stacked here).

## Task checklist
- [ ] Plan (this file)
- [ ] `QuantityStepper`, `Checkbox`, `Toggle` + tests
- [ ] `schemas.ts`, `breadcrumb.ts` + tests
- [ ] `useCheckoutForm` hook
- [ ] Components: `CartItems`, `AddressForm`, `PhoneField`, `GrandTotalPanel`, `CouponField`, `GiftPointsToggle`, `CheckoutSkeleton`
- [ ] `CheckoutPage` composition + page tests
- [ ] Typecheck, lint, tests for owned files
