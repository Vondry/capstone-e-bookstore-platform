# 05 — S3 Product detail (`/books/:handle`)

## Goal
Build the product detail screen so a customer can **7 Select product** (see details, writer, reviews, related reads) and **8 Add to basket** (or save to a wishlist).

## Wireframe reference
**File:** `docs/wireframes/02-product-detail.png`

- Breadcrumb "Home / Non-Fiction / Self Help" (top category linked, sub category shown as current).
- Left: front + back cover side by side. Right of covers: title (regular weight), "by {author}" link, short description, "Published by: {publisher}" link, format, comma-separated category links, big bold price "₹149", "Delivery by **Mon, 21 Jul**".
- Buttons: "Add to Cart" (primary, cart icon right), "Add to Wishlist" (secondary grey, bookmark icon right).
- Meta row: Language (icon + "English" link) · Rating (icon + 5 yellow stars) · Sells (icon + "145 copies sold").
- "About the writer": round avatar, name, bio paragraphs.
- "Reviews": textarea "Leave Your Review" with "0/100", 5 empty stars, "Submit" (primary, arrow icon); review list (name, text, stars) on the right.
- Right column "Related Reads" separated by a vertical divider, 3 horizontal book cards.

**Open questions** (decided here, documented as assumptions):
1. Back cover: `Book.backCoverUrl` is not set on any mock book. Decision: render the back cover only when the URL exists; otherwise show the front cover alone (no generated placeholder).
2. Writer avatar photo: no images exist. Decision: inline SVG data URI with initials (mock data).
3. Reviewer name: no field in the wireframe. Decision: the logged-in customer's first name + last initial, otherwise "Guest reader".
4. The wireframe review list shows a sample "John Smith" review. Decision: no seeded fake reviews; show an empty state ("No reviews yet…") until the visitor adds one.
5. `/writers/:slug` and `/publishers/:slug` routes do not exist yet; links are rendered per the spec and will 404 until those screens are built.
6. Language link target: `/?language={lowercase}` (the catalogue filter).

## Component tree
- `ProductPage` (modify — `src/pages/ProductPage.tsx`)
  - `PageContainer` (reuse)
  - `ProductSkeleton` (new) / `EmptyState` (reuse, not found) / `ErrorState` (reuse)
  - `Breadcrumb` (reuse)
  - `ProductOverview` (new)
    - `BookCovers` (new)
    - `ProductInfo` (new) — title, author, description, publisher, format, categories, price, delivery
    - `ProductActions` (new) — `Button` ×2 (reuse), `useAddToCart` (reuse), `useWishlist` (new), `useToast` (reuse)
    - `ProductMeta` (new) — `RatingStars` (new, `components/ui`)
  - `WriterSection` (new) — `Skeleton`, `ErrorState`
  - `ReviewsSection` (new)
    - `ReviewForm` (new) — RHF + Zod, `RatingStarsInput` (new)
    - `ReviewList` (new) — `RatingStars`
  - `RelatedReads` (new) — `BookCard` (reuse), `Skeleton`, `EmptyState`, `ErrorState`

## Files
| Path | Action | Purpose |
|---|---|---|
| `docs/plans/05-s3-product-detail.md` | create | this plan |
| `src/pages/ProductPage.tsx` (+ `.test.tsx`) | modify/create | page composition, states, document title |
| `src/features/product/types.ts` | create | `Writer`, `Review` |
| `src/features/product/api.ts` | create | `fetchProduct(handle)` (null on 404), `fetchWriter(slug)` (null on 404) |
| `src/features/product/hooks/useProduct.ts` | create | `productQueryKeys`, `useProduct`, `useRelatedBooks`, `useWriter` |
| `src/features/product/hooks/useReviews.ts` | create | local review list + add |
| `src/features/product/lib/breadcrumb.ts` (+ test) | create | `buildProductBreadcrumb(book)` |
| `src/features/product/lib/related.ts` (+ test) | create | `relatedCategory(book)`, `pickRelatedBooks(book, books, limit)` |
| `src/features/product/lib/reviews.ts` (+ test) | create | SIMULATED localStorage storage per handle |
| `src/features/product/lib/schemas.ts` (+ test) | create | `reviewSchema` (Zod) |
| `src/features/product/components/*.tsx` | create | components listed above |
| `src/features/wishlist/lib/wishlist.ts` (+ test) | create | SIMULATED localStorage wishlist: get/has/add/remove/toggle |
| `src/features/wishlist/hooks/useWishlist.ts` | create | React binding (`useSyncExternalStore`) |
| `src/components/ui/RatingStars.tsx` (+ test) | create | display stars + accessible radio-group input |
| `src/mocks/data/writers.ts` | create | writer bios + initials avatars for every mock author |
| `src/mocks/handlers/writers.ts` | modify | `GET */store/writers/:slug` |

## Data
- `useProduct(handle)` → `fetchProduct` → `GET /store/products/:handle` via `apiFetch` (returns `{ product: Book }`, 404 → `null`). Query key `['product', 'detail', handle]`.
  Medusa reference: https://docs.medusajs.com/api/store#products_getproductsid (real backend retrieves by id; the handle route is the existing mock contract — TODO when switching to `@medusajs/js-sdk`: `sdk.store.product.list({ handle })`).
- `useRelatedBooks(book)` → catalog `fetchBooks({ category })` (reuse) + pure `pickRelatedBooks` (same most-specific category, exclude current, max 3). Key `['product', 'related', handle]`.
- `useWriter(slug)` → `fetchWriter` → `GET /store/writers/:slug` → `{ writer: Writer }`. **SIMULATED**: Medusa has no writers module; served by MSW.
- `useAddToCart()` (reuse) with `book.variantId`; toast on success/error.
- **SIMULATED** reviews: localStorage key `bw.reviews.{handle}`; **SIMULATED** wishlist: localStorage key `bw.wishlist` (array of handles).
- Delivery: `formatDeliveryDate(format)` (reuse, SIMULATED +3 business days, eBook → Instant).
- Types: `Book` (catalog), `Writer { slug, name, bio: string[], avatarUrl }`, `Review { id, name, text, rating, createdAt }`.

## States
| Part | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Product | `ProductSkeleton` mirroring covers/info/related layout | "Book not found" `EmptyState` + link to catalogue | `ErrorState` + retry | full page, title "{title} · Book Worm" |
| Writer | avatar + 3 text-line skeleton | "No biography available yet." | inline `ErrorState` + retry | avatar, name, bio |
| Related | 3 card skeletons | "No related reads yet." | `ErrorState` + retry | 3 `BookCard`s |
| Add to cart | button `loading` | — | error toast | success toast, header badge updates |
| Reviews (local) | — | "No reviews yet. Be the first to review this book." | validation errors under fields | review prepended, form reset, polite status |

## Responsive behaviour
- **sm (<672)**: single column; covers row on top (front cover max ~240 px wide), info below; buttons stacked full width; meta row wraps; review form above list; Related Reads below reviews.
- **md (≥672)**: covers and info side by side; buttons inline; review form and list side by side.
- **lg (≥1056)**: two-column page grid — main content + right "Related Reads" column (~360 px) with a left border as vertical divider.
- **xlg (≥1312)**: wider related column; same structure.
- No horizontal scroll at 320 px; buttons 48 px tall.

## Accessibility
- One `h1` (title); `h2` for "About the writer", "Reviews", "Related Reads"; related reads in an `<aside aria-labelledby>`.
- Breadcrumb `nav[aria-label=Breadcrumb]` (reuse).
- Cover alt "{title} by {author} — cover" (back cover: "… — back cover").
- Display stars: `role="img"` with `aria-label="Rated 4.0 out of 5"`.
- Star input: `fieldset` + `legend` "Your rating", 5 visually-hidden native radios ("1 star"…"5 stars") → arrow keys work natively; visible focus ring on the focused star.
- Textarea with visible label "Leave Your Review", counter in `aria-live="polite"`, errors linked by `aria-describedby` and `aria-invalid`.
- Wishlist button is a toggle (`aria-pressed`), label stays "Add to Wishlist".
- Toasts provide mutation feedback; focus stays on the trigger.

## Tests
- Unit (Vitest): `breadcrumb.ts`, `related.ts`, `reviews.ts` (storage, corrupted JSON, unavailable storage), `schemas.ts` (empty, >100 chars, missing rating, valid), `wishlist.ts` (add/has/remove/toggle/corrupt).
- Component (RTL): `RatingStars` display label; `RatingStarsInput` click + keyboard arrow selection.
- Page (RTL + MSW): renders product (heading, author link, publisher link, price, breadcrumb, cover alt, writer bio); Add to Cart calls cart API (badge source `cart` updated) + toast; Add to Wishlist toggles + toast; review validation (empty, >100 chars, rating required) and successful submit appears in list + persisted; Related Reads shows 3 same-category books excluding the current one; not-found state; error + retry recovers.
- E2E: covered by the shared golden path (browse → product → add to cart); no new spec in this task.

## Risks & open questions
- Concurrent agents edit shared files — this plan touches only S3-owned files; `useProduct` lives in `features/product` instead of the shared `useBooks.ts`.
- `/writers/:slug` and `/publishers/:slug` links 404 until routes exist (change needed in `App.tsx`, not owned here).
- Medusa store API retrieves products by id; the handle-based route is a mock contract.
- Local reviews are per browser only and never reach the backend.

## Task checklist
- [x] Plan (this file)
- [x] `RatingStars` + `RatingStarsInput` + tests
- [x] Wishlist lib + hook + tests
- [x] Writer mock data + handler
- [x] Product types, api, hooks
- [x] Product libs (breadcrumb, related, reviews, schemas) + tests
- [x] Product components (overview, writer, reviews, related, skeleton)
- [x] `ProductPage` composition + page tests
- [x] Typecheck, lint, tests for owned files
