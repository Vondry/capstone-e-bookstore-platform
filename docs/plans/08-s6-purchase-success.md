# 08 — S6 Purchase success (`/orders/:id/success`)

## 1. Goal
Build the purchase confirmation screen so the customer completes journey step **12 Purchase confirmation**: they see what they bought, their order number and the gift points earned, then continue shopping.

## 2. Wireframe reference
**File:** `docs/wireframes/05-purchase-success.png`

- Full-bleed illustrated background (books, confetti) under the 48 px header, no category sidebar.
- Centred dark panel (~650 px wide, `layer-1`, 24–32 px padding).
- Green round check icon on top, centred.
- Heading "Your purchase of the following reads is successful" (20 px, centred, wraps to 2 lines).
- Purchased books as horizontal book cards in 2 columns (cover, title, author link, description, format, category links, price, delivery line).
- Primary button "Continue your Shopping" with an icon on the right (looks like Carbon `Catalog`), centred.

**Open questions** (decided here, documented as assumptions):
1. Order number and points earned are required by `03-screens.md` but not drawn. Decision: show them under the heading as two lines: "Order #1003" and "You earned 47 gift points".
2. Guests also earn points per the order total, but cannot keep them. Decision: show the earned points line for every order; for guests add "Log in to collect points next time" linking to `/login`.
3. Quantity is not drawn. Decision: show "Qty 2" in the card's `children` slot only when quantity > 1.
4. Check icon size: the design system says icons are 16/20 px, but the wireframe hero icon is ~48 px. Decision: `CheckmarkFilled` at 48 px as a deliberate hero exception.
5. More than 4 books: the grid keeps growing and the page scrolls naturally (no inner scroll area).
6. Delivery line: `BookCard` computes delivery from "now" rather than the order date — acceptable on the success page since the order was just placed.

## 3. Component tree
- `OrderSuccessPage` (modify — `src/pages/OrderSuccessPage.tsx`)
  - `IllustratedBackground` (reuse)
  - `PurchaseSuccessSkeleton` (new) — `Skeleton` (reuse)
  - `EmptyState` (reuse, 404) / `ErrorState` (reuse, other errors + retry)
  - `PurchaseSuccessPanel` (new)
    - `CheckmarkFilled` icon (reuse, Carbon)
    - heading `h1` (tabIndex -1, focused on mount)
    - `OrderMeta` lines: order number, points, guest login hint
    - `PurchasedBooks` (new) — `BookCard` (reuse) ×n, optional "Qty n"
    - "Continue your Shopping" `Link` styled as primary button, `Catalog` icon right

## 4. Files
| Path | Action | Purpose |
|---|---|---|
| `src/pages/OrderSuccessPage.tsx` | modify | Route page: read `:id`, `useOrder`, `useCustomer`, title, states |
| `src/pages/OrderSuccessPage.test.tsx` | create | Page tests (RTL + MSW) |
| `src/features/orders/components/success/PurchaseSuccessPanel.tsx` | create | Panel: icon, focused heading, order number, points, books, CTA |
| `src/features/orders/components/success/PurchasedBooks.tsx` | create | 1/2-column grid of `BookCard`s |
| `src/features/orders/components/success/PurchaseSuccessSkeleton.tsx` | create | Loading placeholder matching the panel |
| `docs/plans/08-s6-purchase-success.md` | create | This plan |

## 5. Data
- `useOrder(id)` (`features/orders/hooks/useOrders.ts`) → `fetchOrder(id)` → `GET /store/orders/:id` (Medusa store orders, https://docs.medusajs.com/api/store#orders). The payment step pre-fills this cache, so the page usually renders instantly.
- `useCustomer()` (`features/auth/hooks/useCustomer.ts`) → `null` for guests.
- Domain type `Order` (`displayId`, `lines[].book`, `lines[].quantity`, `pointsEarned`).
- **Simulated**: `pointsEarned` (1 point per ₹10, computed at checkout); the HTTP client talks to MSW-mocked Medusa-shaped routes.

## 6. States
| Part | Loading | Empty / not found | Error | Success |
|---|---|---|---|---|
| Order | `PurchaseSuccessSkeleton` in the panel shape | `ApiError` 404 → `EmptyState` "We couldn't find that order" + link home | `ErrorState` with "Try again" → `refetch()` | Panel |
| Customer | treated as unknown → no guest hint | — | treated as guest-unknown → no hint | hint only when `data === null` |

## 7. Responsive behaviour
- sm (< 672): panel full width minus 16 px gutters, padding 24, books in 1 column.
- md+: books in 2 columns, panel max-width ~650 px (`max-w-[650px]`), padding 32.
- lg / xlg: unchanged; panel stays centred over the illustration. No horizontal scroll at 320 px.

## 8. Accessibility
- One `h1` (the success heading) with `tabIndex={-1}`, focused on mount so screen readers announce it.
- Book list is a `ul` labelled "Purchased books"; each card is an `article` with its own `h3`.
- Check icon is decorative (`aria-hidden`).
- CTA is a real link (`<a href="/">`) with visible focus ring, 48 px tall.
- Document title "Order confirmed · Book Worm".

## 9. Tests
`src/pages/OrderSuccessPage.test.tsx` (RTL + MSW, seeded `order_seed_1002`):
- renders the purchased books, "Order #1002" and the points line;
- heading receives focus after loading;
- "Continue your Shopping" navigates to `/`;
- guest sees "Log in to collect points next time"; logged-in (`loginAsDemo`) user does not;
- unknown id → not-found state with link home;
- server 500 → error state; "Try again" refetches and shows the order.
- Sets the document title.

## 10. Risks & open questions
- The CTA must be a link, but `Button` renders a `<button>`; the link copies the primary button classes (candidate for a shared `ButtonLink` later).
- Real Medusa: a guest fetching `/store/orders/:id` may need the cart/order token; the mock allows it.

## 11. Task checklist
- [ ] Write this plan
- [ ] `PurchaseSuccessSkeleton`, `PurchasedBooks`, `PurchaseSuccessPanel`
- [ ] `OrderSuccessPage` with states + title
- [ ] Tests
- [ ] typecheck / lint / test on owned files
