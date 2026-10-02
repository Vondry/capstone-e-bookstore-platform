# 03 — Screens (spec per wireframe)

All screens share the **Header**: a menu icon and "Book Worm" logo on the left; nav links
"My Orders · My Wishlist · My Writers"; a cart icon with a red count badge and a profile icon on the right.
They also share a **Footer** (links, © Book Worm). The footer is not in the wireframes, so keep it minimal and consistent.

| # | Route | Wireframe | Journey steps |
|---|---|---|---|
| S1 | `/login`, `/register` | — (no wireframe: build from the design system) | 1 Login, 2 Authentication |
| S2 | `/` and `/category/:handle` | `01-home-catalogue.png` | 3, 5, 6 + recommendations |
| S3 | `/books/:handle` | `02-product-detail.png` | 7 Select product, related products, 8 Add to basket |
| S4 | `/checkout` | `03-cart-checkout.png` | 8 Basket, 9 Delivery address, coupon, gift points |
| S5 | `/payment` | `04-payment.png` | 10 Initiate payment, 11 Payment confirmation |
| S6 | `/orders/:id/success` | `05-purchase-success.png` | 12 Purchase confirmation |
| S7 | `/orders` | — (no wireframe) | 2 Order history, Buy it again, Cancel within 48 h |
| S8 | `/wishlist`, `/writers/:slug`, `/publishers/:slug` | — (no wireframe) | 6 Browse brands (writers/publishers) |

## S2 Home / Catalogue
- Left sidebar: "All" plus 19 genres (Romance … Language Learning). The selected item has a `--layer-2` background and a 3 px left bar in `--interactive`.
- Filter bar: Search ("Search you want to read here"), Language, Format (Paperback, eBook etc), Price Range, Sort by (Relevance, Price ↑, Price ↓, Newest, Bestselling). Filters sync to URL search params.
- Sections, each in a 3-column grid of horizontal book cards:
  - "Recommended for You" — only when logged in and has orders, otherwise hidden.
  - "Bestsellers this Month".
  - "New Launches".
  - With an active category, search or filter, the sections are replaced by one results grid with a count.
- Book card: cover · title (20 px) · "by {author}" (link) · 2-line description · format · category links · price (bold 20 px) · "Delivery by **Mon, 21 Jul**".

## S3 Product detail
- Breadcrumb: Home / {top category} / {sub category}.
- Front and back cover images side by side (back optional).
- Title, "by {author}", short description, "Published by: {publisher}" (link), format, categories, big price, delivery estimate.
- Buttons: **Add to Cart** (primary, cart icon) and **Add to Wishlist** (secondary, bookmark icon).
- Meta row: Language · Rating (stars) · Sells ("145 copies sold").
- "About the writer": avatar, name, bio.
- "Reviews": textarea "Leave Your Review" with a 0/100 counter, 5-star input, Submit button, list of reviews. Reviews may be simulated (local only), marked `// SIMULATED:`.
- Right column "Related Reads": 3 cards from the same category, excluding the current book.

## S4 Shopping cart + checkout (single page)
- Breadcrumb ending in "Checkout". Title "Shopping Cart".
- Cart items: cover, info and a quantity stepper (−/+). Quantity 0 asks for confirmation, then removes the item. Show an empty-cart state with a CTA back to the catalogue.
- Address panel: "Use Saved Address" checkbox (logged-in only; prefills the fields). Fields: First Name, Last Name, Address, e-mail, City, Pin (6 digits), Phone (country code select +91, 10 digits), State, Country (default India). Validate with Zod and show inline errors.
- Grand Total panel (with illustration): Price (n items), Tax, Delivery Charges ("Free" when over the threshold), Apply Coupon (input + Apply), **Redeem gift points** (toggle + available balance), Discount, **Total Amount**, **Pay Now** → `/payment`.

## S5 Payment
- Illustrated background. A centred panel titled "Complete Payment" with "Payable Amount: ₹580" on the right.
- Vertical tabs: Credit Card | Debit card | UPI | Wallet.
  - Card fields: Card Number (masked `XXXX-XXXX-XXXX-XXXX`, Luhn check), Name on Card, CVV (3 digits, masked), Date of Expiry (MM/YYYY, not in the past).
  - UPI: UPI ID (`name@bank`).
  - Wallet: wallet select.
- **Pay Now**: disabled until valid. Show a loading state ("Processing payment…") and prevent double submit. On success, complete the cart and go to S6. On failure, show an inline error and keep the form data except CVV.

## S6 Purchase success
- Same illustrated background. Centred panel with a green check icon and the text "Your purchase of the following reads is successful".
- Cards for the purchased books. Order number. Points earned.
- CTA **Continue your Shopping** → `/`. Move focus to the heading on load.

## S7 My Orders (no wireframe — reuse the S2 card and S4 panel styles)
- A list of orders, newest first: order no., date, status, items, total.
- Per item: **Buy it again** (adds to cart, then shows a toast).
- Per order: **Cancel order**, visible only within 48 h of placing (see 01 → simulated features). Ask for confirmation first.
- Empty state for users with no orders. Guests see a login prompt.

## S1 Login / Register (no wireframe)
- A centred panel like S5. Fields: e-mail, password. Show/hide password. "Continue as guest" link.
- After login, redirect to the page the user came from (`?redirect=`).

## Every screen must have
Loading skeletons that match the final layout, an empty state, an error state with retry,
and a correct document title ("{Page} · Book Worm").
