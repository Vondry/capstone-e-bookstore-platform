# 13 — E2E Tests with Playwright

## Goal
Create comprehensive end-to-end tests covering the main user journeys through the Book Worm bookstore, including guest checkout, authenticated flows, wishlist management, order history, and responsive behavior across mobile (375×812), tablet (768×1024), and desktop (1440×900) viewports.

## Wireframe reference
All wireframes in `docs/wireframes/` (01-05). Tests will verify the complete user journey from browsing to purchase confirmation, matching the layouts and interactions shown in the wireframes.

## Test Coverage Strategy

### 1. Golden Path Tests (Priority 1)
**File:** `tests/e2e/golden-path.spec.ts`

#### Guest Checkout Flow
- [ ] Browse catalogue (home page with bestsellers and new launches)
- [ ] Filter/search for books
- [ ] Navigate to product detail page
- [ ] Add book to cart
- [ ] View cart and update quantity
- [ ] Proceed to checkout as guest
- [ ] Fill delivery address form
- [ ] Apply coupon (if available)
- [ ] Proceed to payment
- [ ] Complete payment with credit card
- [ ] View purchase success page
- [ ] Verify order confirmation details

#### Authenticated User Flow
- [ ] Register new account
- [ ] Login
- [ ] Browse with personalized recommendations
- [ ] Add multiple books to cart
- [ ] Use saved address at checkout
- [ ] Redeem gift points
- [ ] Complete purchase
- [ ] View order in order history
- [ ] Buy it again from order history

### 2. Responsive Tests (Priority 1)
**File:** `tests/e2e/responsive.spec.ts`

Test the golden path at three breakpoints with screenshots:
- [ ] Mobile (375×812) - iPhone 12
- [ ] Tablet (768×1024) - iPad Pro  
- [ ] Desktop (1440×900) - Desktop Chrome

Each test should:
- Take screenshots at key steps (home, product, cart, checkout, payment, success)
- Verify responsive UI elements (collapsed nav, drawer, filter buttons)
- Test touch interactions on mobile
- Verify sticky elements and layout changes

### 3. Feature-Specific Tests (Priority 2)

#### Wishlist Management
**File:** `tests/e2e/wishlist.spec.ts`
- [ ] Add book to wishlist from product page
- [ ] View wishlist page
- [ ] Remove book from wishlist
- [ ] Add book from wishlist to cart
- [ ] Empty wishlist state

#### Order Management
**File:** `tests/e2e/orders.spec.ts`
- [ ] View order history (authenticated)
- [ ] View order details
- [ ] Cancel order within 48h window
- [ ] Verify cancel button disappears after 48h (use fake timers)
- [ ] Buy it again functionality
- [ ] Empty orders state for new users
- [ ] Guest user sees login prompt

#### Category & Brand Browsing
**File:** `tests/e2e/browsing.spec.ts`
- [ ] Navigate through category sidebar
- [ ] Filter by language, format, price range
- [ ] Sort by price, newest, bestselling
- [ ] Search functionality
- [ ] URL sync for filters
- [ ] Browse by writer
- [ ] Browse by publisher
- [ ] Related reads on product page

#### Authentication
**File:** `tests/e2e/auth.spec.ts`
- [ ] Register new account with validation
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error state)
- [ ] Logout
- [ ] Redirect after login (preserve ?redirect= param)
- [ ] Continue as guest
- [ ] Access protected routes (orders) without login

### 4. Edge Cases & Error States (Priority 3)
**File:** `tests/e2e/edge-cases.spec.ts`

- [ ] Empty cart checkout attempt
- [ ] Invalid address form submission
- [ ] Invalid payment details
- [ ] Payment failure handling
- [ ] Network error during checkout
- [ ] Out of stock handling (if applicable)
- [ ] Quantity limits
- [ ] Invalid coupon code
- [ ] Insufficient gift points

### 5. Accessibility Tests (Priority 2)
**File:** `tests/e2e/accessibility.spec.ts`

- [ ] Keyboard navigation through checkout flow
- [ ] Focus management (payment → success page)
- [ ] Screen reader landmarks
- [ ] Form labels and error announcements
- [ ] Cart count aria-live announcements
- [ ] Skip links
- [ ] Color contrast (automated check)

## Test Structure & Patterns

### Page Object Model
Create page objects for reusable interactions:

```
tests/e2e/
├── fixtures/
│   ├── test-data.ts          # Mock books, users, addresses
│   └── auth.ts               # Authentication helpers
├── pages/
│   ├── HomePage.ts
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   ├── PaymentPage.ts
│   ├── OrderSuccessPage.ts
│   ├── OrdersPage.ts
│   └── WishlistPage.ts
├── golden-path.spec.ts
├── responsive.spec.ts
├── wishlist.spec.ts
├── orders.spec.ts
├── browsing.spec.ts
├── auth.spec.ts
├── edge-cases.spec.ts
└── accessibility.spec.ts
```

### Common Patterns

#### Setup & Teardown
```typescript
test.beforeEach(async ({ page }) => {
  // Start with MSW mocks enabled
  await page.goto('/');
  // Clear cart/wishlist state
});
```

#### Screenshot Strategy
```typescript
await page.screenshot({ 
  path: `screenshots/${viewport}-${step}.png`,
  fullPage: true 
});
```

#### Assertions
- Use `expect(page.getByRole(...))` for accessibility
- Verify URL changes for navigation
- Check cart badge count updates
- Verify toast notifications appear
- Confirm form validation messages

#### Fake Timers for Time-Based Features
```typescript
// Test 48h cancel window
await page.clock.install({ time: new Date('2024-01-01T10:00:00') });
// ... place order
await page.clock.fastForward('49:00:00'); // 49 hours
// Verify cancel button is hidden
```

## Data Strategy

### Test Data
- Use consistent test data from `tests/e2e/fixtures/test-data.ts`
- Mock books with predictable IDs, handles, prices
- Test addresses for different validation scenarios
- Valid/invalid payment card numbers (Luhn check)

### MSW Integration
- Tests run against MSW handlers from `src/mocks/`
- Handlers should return consistent, predictable data
- Add specific handlers for error scenarios
- Simulate network delays for loading states

## Responsive Breakpoint Tests

### Mobile (375×812)
- Verify collapsed navigation (menu icon)
- Test drawer for categories
- Filter button opens bottom sheet
- Horizontal scrollable payment tabs
- Touch-friendly targets (≥44px)

### Tablet (768×1024)
- 2-column book grid
- Filter bar wraps to 2 rows
- Side-by-side layout for some sections

### Desktop (1440×900)
- Category sidebar visible
- 3-column book grid
- Single-row filter bar
- Sticky Grand Total panel
- Related Reads as right column

## Screenshot Locations
All screenshots saved to `tests/e2e/screenshots/` with naming:
- `{viewport}-{screen}-{step}.png`
- Example: `mobile-checkout-address-filled.png`

## Success Criteria

### Must Pass
- [ ] All golden path tests pass on desktop
- [ ] Responsive tests pass on all 3 viewports
- [ ] Authentication flow works correctly
- [ ] Cart and checkout complete successfully
- [ ] Payment validation works
- [ ] Order history displays correctly

### Should Pass
- [ ] Wishlist management works
- [ ] Cancel order within 48h works
- [ ] Filter and search work correctly
- [ ] Error states display properly
- [ ] Accessibility tests pass

### Performance
- [ ] Each test completes in < 30 seconds
- [ ] No flaky tests (retry on CI if needed)
- [ ] Screenshots captured at key steps

## Files to Create

| Path | Purpose |
|------|---------|
| `tests/e2e/fixtures/test-data.ts` | Mock data for books, users, addresses |
| `tests/e2e/fixtures/auth.ts` | Authentication helper functions |
| `tests/e2e/pages/HomePage.ts` | Page object for home/catalogue |
| `tests/e2e/pages/ProductPage.ts` | Page object for product detail |
| `tests/e2e/pages/CartPage.ts` | Page object for cart/checkout |
| `tests/e2e/pages/CheckoutPage.ts` | Page object for checkout form |
| `tests/e2e/pages/PaymentPage.ts` | Page object for payment |
| `tests/e2e/pages/OrderSuccessPage.ts` | Page object for success page |
| `tests/e2e/pages/OrdersPage.ts` | Page object for order history |
| `tests/e2e/pages/WishlistPage.ts` | Page object for wishlist |
| `tests/e2e/golden-path.spec.ts` | Main user journey tests |
| `tests/e2e/responsive.spec.ts` | Responsive behavior tests |
| `tests/e2e/wishlist.spec.ts` | Wishlist feature tests |
| `tests/e2e/orders.spec.ts` | Order management tests |
| `tests/e2e/browsing.spec.ts` | Catalogue browsing tests |
| `tests/e2e/auth.spec.ts` | Authentication tests |
| `tests/e2e/edge-cases.spec.ts` | Error and edge case tests |
| `tests/e2e/accessibility.spec.ts` | Accessibility tests |

## Risks & Open Questions

### Risks
1. **MSW mock completeness**: Need to ensure all API endpoints used in e2e flows have corresponding MSW handlers
2. **Timing issues**: Async operations may cause flaky tests without proper waits
3. **Screenshot storage**: Large number of screenshots may bloat the repo
4. **Test data consistency**: Need stable test data that doesn't change between runs

### Open Questions
1. Should we test with real Medusa backend or only MSW mocks?
2. What's the strategy for visual regression testing beyond screenshots?
3. Should we include performance metrics (Lighthouse) in e2e tests?
4. How to handle gift points balance across tests (reset between tests)?
5. Should we test theme toggle (dark/light) in e2e tests?

## Task Checklist

### Setup & Infrastructure
- [ ] Create test fixtures directory and test data
- [ ] Create page object base class with common methods
- [ ] Set up screenshot directory structure
- [ ] Configure Playwright projects for exact viewport sizes

### Page Objects (Foundation)
- [ ] Implement HomePage page object
- [ ] Implement ProductPage page object
- [ ] Implement CartPage page object
- [ ] Implement CheckoutPage page object
- [ ] Implement PaymentPage page object
- [ ] Implement OrderSuccessPage page object
- [ ] Implement OrdersPage page object
- [ ] Implement WishlistPage page object

### Core Tests (Priority 1)
- [ ] Write golden-path.spec.ts (guest checkout)
- [ ] Write golden-path.spec.ts (authenticated user)
- [ ] Write responsive.spec.ts (mobile)
- [ ] Write responsive.spec.ts (tablet)
- [ ] Write responsive.spec.ts (desktop)

### Feature Tests (Priority 2)
- [ ] Write auth.spec.ts
- [ ] Write wishlist.spec.ts
- [ ] Write orders.spec.ts
- [ ] Write browsing.spec.ts
- [ ] Write accessibility.spec.ts

### Edge Cases (Priority 3)
- [ ] Write edge-cases.spec.ts
- [ ] Add error state tests
- [ ] Add validation tests
- [ ] Add network error simulations

### Verification
- [ ] Run all tests locally and verify pass rate
- [ ] Review screenshots for visual correctness
- [ ] Check test execution time
- [ ] Verify CI configuration
- [ ] Document any known flaky tests

## Notes

- All tests use MSW handlers from `src/mocks/` for consistent, fast execution
- Tests should be independent and not rely on execution order
- Use `test.describe.serial()` only when absolutely necessary
- Prefer `page.getByRole()` and `page.getByLabel()` over test IDs
- Each test should clean up its state (cart, wishlist) in afterEach
- Screenshots are for visual verification, not snapshot testing
- Focus on user-facing behavior, not implementation details
