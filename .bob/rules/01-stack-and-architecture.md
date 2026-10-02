# 01 — Stack & Architecture

## Folder structure (feature-based)
```
src/
  app/                 # router, providers (QueryClient, Theme), root layout, error boundary
  components/
    ui/                # design-system primitives: Button, TextInput, Select, Checkbox, Tag,
                       # Breadcrumb, RatingStars, Price, QuantityStepper, Skeleton,
                       # EmptyState, ErrorState, Tabs, Drawer
    layout/            # Header, CategorySidebar, Footer, PageShell
  features/
    auth/  catalog/  product/  cart/  checkout/  payment/
    orders/  wishlist/  writers/  recommendations/  loyalty/
      components/      # feature UI
      hooks/           # TanStack Query hooks (useBooks, useCart, ...)
      api.ts           # the ONLY place that calls the Medusa SDK for this feature
      mappers.ts       # Medusa DTO -> domain type
      lib/             # pure functions (no React, no I/O) — always unit-tested
      types.ts
  lib/                 # medusa client, formatters (currency, dates), cn()
  mocks/               # MSW handlers mirroring api.ts (used when backend is down)
  styles/tokens.css    # design tokens (see 02-design-system.md)
tests/e2e/             # Playwright
```

## Data flow rules
- Data flows one way: component → feature hook → `api.ts` → Medusa SDK.
- Components never import the SDK or `fetch` directly.
- `api.ts` returns **domain types** (e.g. `Book`, `CartLine`, `Order`). Map Medusa DTOs in `mappers.ts` so the UI never depends on backend shapes.
- Server state lives in TanStack Query only. Client-only UI state uses `useState` or a small context. No Redux or Zustand.
- Every query key is defined in a `queryKeys` object per feature.
- Mutations (add to cart, update quantity, place order) invalidate the related queries, and use optimistic updates where it improves the UX (quantity stepper).

## Domain model (frontend)
```ts
type Book = {
  id: string; handle: string; title: string; subtitle?: string;
  author: { name: string; slug: string }; publisher?: { name: string; slug: string };
  description: string; format: 'Paperback' | 'Hardcover' | 'eBook';
  categories: { name: string; handle: string }[]; language: string;
  priceInr: number; coverUrl: string; backCoverUrl?: string;
  rating?: number; soldCount?: number; variantId: string;
};
```
Medusa mapping: author, publisher, format, language, rating and soldCount come from
`product.metadata`. Categories come from product categories. Price comes from the variant's
calculated price in the INR region.

## Backend (Medusa v2)
- Client: `src/lib/medusa.ts` exports a single `sdk` instance (base URL + publishable key from `import.meta.env`).
- Before using an SDK method, confirm it exists in the docs (https://docs.medusajs.com/resources/js-sdk). If unsure, stop and ask.
- Guest checkout must work. Login is optional and unlocks order history, saved address, gift points and recommendations.

## Simulated features (not provided by Medusa out of the box)
Implement these as pure functions in `features/*/lib`, mark each with a `// SIMULATED:` comment, and unit-test them:
- **Delivery estimate**: `estimateDelivery(format, orderDate)`. eBook → "Instant". Otherwise +3 business days. Displayed as "Delivery by Mon, 21 Jul".
- **Gift points**: earn 1 point per ₹10 spent, redeem 1 point = ₹1, capped at 50 % of the subtotal. Store per customer (customer metadata, or localStorage for guests).
- **Recommendations**: books from the categories of past orders, excluding books already bought. Fall back to bestsellers.
- **Cancel within 48 h**: show "Cancel order" only while `now - order.createdAt < 48h`. If no store-side cancel endpoint exists, mark the order as cancelled client-side and label it "Cancellation requested". Never pretend it was processed.
- **Payment methods** (Credit card / Debit card / UPI / Wallet): UI and validation only. Complete the cart through Medusa's default/manual payment provider. **Never persist or log card data.**
