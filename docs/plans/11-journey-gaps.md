# 11 — Customer journey gaps (recommendations, brands, wishlist, footer)

## 1. Goal
Close the journeys from the capstone deck (slides 5, 10–14) that are still missing: **2** recommendations based on order history (home + cart), **6** browse the brands (writers and publishers), the **My Wishlist** page, and the shared **Footer** (S8 in `03-screens.md`).

## 2. Wireframe reference
No wireframe for these screens. They reuse S2 (BookCard grid, section headings), S3 ("About the writer" block) and S4 (bg-layer-1 panels).
- Deck slide 11 shows "Recommends items based on Order History" on the cart screen; slides 10–14 show a footer.
- **Open questions** (decided, flagged for review):
  - "My Writers" has no spec → `/writers` shows "Your writers" (from your orders and wishlist) above "All writers".
  - Guests in the cart get bestsellers ("Popular right now"), as `01-stack-and-architecture.md` says recommendations fall back to bestsellers.

## 3. Component tree
- `PageShell` (modify) → adds `Footer` (new)
- `HomePage` (modify) → "Recommended for You" only when logged in with orders (`useRecommendations`, new)
- `CheckoutPage` → `CheckoutContent` (modify) → `RecommendedForCart` (new)
- `WishlistPage` (new) → `BookGrid`-style list of `BookCard` (reuse) + `WishlistItemActions` (new)
- `WritersPage` (new) → `WriterCard` (new) grid; `WriterPage` (new) → `WriterProfile` (new) + book grid
- `PublishersPage` (new) → `PublisherCard` (new); `PublisherPage` (new) → header + book grid

## 4. Files
| Path | Action | Purpose |
|---|---|---|
| `src/features/recommendations/lib/recommend.ts` (+ test) | create | Pure: books from the categories of past orders, excluding bought ones; bestseller fallback |
| `src/features/recommendations/hooks/useRecommendations.ts` | create | Combines customer, orders and catalogue queries |
| `src/features/recommendations/components/RecommendedForCart.tsx` | create | Cart-page section |
| `src/features/brands/{types,api}.ts`, `hooks/useBrands.ts` | create | Writers/publishers list + detail, books by writer/publisher |
| `src/features/brands/components/*` | create | WriterCard, PublisherCard, BrandBooks |
| `src/features/wishlist/hooks/useWishlist.ts` | modify | Add `useWishlist()` (all handles) |
| `src/features/wishlist/components/WishlistItemActions.tsx` | create | Add to cart / remove |
| `src/pages/{Wishlist,Writers,Writer,Publishers,Publisher}Page.tsx` (+ tests) | create | New routes |
| `src/components/layout/Footer.tsx` (+ test), `PageShell.tsx` | create/modify | Footer |
| `src/mocks/data/publishers.ts`, `src/mocks/handlers/{writers,books}.ts` | create/modify | Writers list, publishers, `author`/`publisher` filters |
| `src/features/catalog/{api.ts,hooks/useBooks.ts}`, `src/mocks/data/books.ts` | modify | Remove the fixed `recommended` endpoint |
| `src/pages/HomePage.tsx`, `src/features/checkout/components/CheckoutContent.tsx`, `src/App.tsx` | modify | Wire sections + routes |

## 5. Data
- New mock store routes (SIMULATED, Medusa has no writers/publishers module): `GET /store/writers`, `GET /store/writers/:slug` (exists), `GET /store/publishers`, `GET /store/publishers/:slug`, and `GET /store/products?author=…|publisher=…`.
- Recommendations use existing data only: `useCustomer`, `useOrders(enabled)`, `useBooks({})`.
- Wishlist stays SIMULATED (localStorage list of handles, from S3).

## 6. States
Each new page: skeleton → success / empty (EmptyState with CTA) / not found / error + retry. Recommendations render nothing while loading or when empty (they're optional content).

## 7. Responsive behaviour
Book grids reuse `BookGrid` (1 / 2 / 3 columns at sm / md / xlg). Writer/publisher cards: 1 column on sm, 2 on md, 3 on lg, 4 on xlg. Footer stacks links on sm, single row from md.

## 8. Accessibility
`<h1>` per page, sections with `aria-labelledby`, `<footer>` landmark with a labelled `<nav>`, avatar `alt=""` next to the visible name, all actions are buttons/links with visible labels.

## 9. Tests
recommend lib (category matching, excludes bought + excluded handles, fallback, limit); WishlistPage (empty, list, remove, add to cart); WritersPage (your writers from orders, all writers); WriterPage (profile + books, not found); PublisherPage (books, not found); Footer links; HomePage recommended hidden for guests / shown for the demo customer.

## 10. Risks & open questions
- Real Medusa has no writers, publishers, wishlist or recommendations → all SIMULATED and marked.
- Recommendations fetch the whole catalogue (24 books) client-side; a real store needs a server endpoint.

## 11. Task checklist
- [x] Recommendations lib + hook, home + cart sections, remove fixed endpoint
- [x] Brands API, mocks, writer/publisher pages + routes
- [x] Wishlist page
- [x] Footer
- [x] Tests, typecheck, lint, browser check
