# 03 — Layout Components (Header, CategorySidebar, Footer, PageShell)

## Goal
Build the core layout components from wireframe 01 (`01-home-catalogue.png`): Header with navigation, CategorySidebar with 19 genres (drawer on mobile), Footer, and PageShell wrapper. Implement responsive behavior where the sidebar becomes a drawer below lg breakpoint.

## Wireframe reference
**File:** `01-home-catalogue.png`

**Header observations:**
- Left: Menu icon (hamburger) + "Book Worm" logo
- Center: Nav links "My Orders · My Wishlist · My Writers" (hidden < md, shown in menu)
- Right: Cart icon with red badge count + Profile icon
- Height: ~64px, dark background (`--layer-1`)

**CategorySidebar observations:**
- Fixed left sidebar, visible ≥ lg
- Width: ~240px
- "All" at top (selected state: `--layer-2` bg + 3px left border `--interactive`)
- 19 genre categories below: Romance, Mystery & Thriller, Science Fiction & Fantasy, Historical Fiction, Literary Fiction, Non-Fiction, Biography & Memoir, Self-Help & Personal Development, Business & Economics, Science & Technology, Health & Wellness, Travel, Cookbooks & Food, Art & Photography, Poetry, Young Adult, Children's Books, Graphic Novels & Comics, Language Learning
- Each item: 14px text, 40px height, hover `--layer-2`

**Footer observations:**
- Not shown in wireframe, so keep minimal
- Links: About, Contact, Privacy, Terms
- Copyright: "© 2026 Book Worm"
- Dark background (`--layer-1`), centered text

**Mobile behavior (< lg):**
- Sidebar hidden by default
- Menu icon in header opens drawer from left
- Drawer: full-height overlay, slides in from left
- Close button (X) in drawer header
- Same category list as desktop sidebar

## Component tree
- `PageShell` (new) - Root layout wrapper
  - `Header` (new) - Top navigation bar
  - `CategorySidebar` (new) - Desktop sidebar ≥ lg
  - `Drawer` (reuse from plan 02) - Mobile category drawer < lg
  - `Footer` (new) - Bottom footer
  - `{children}` - Page content

## Files

| Path | Action | Purpose |
|------|--------|---------|
| `src/components/layout/Header.tsx` | create | Top navigation with menu, logo, nav links, cart, profile |
| `src/components/layout/Header.test.tsx` | create | Header component tests |
| `src/components/layout/CategorySidebar.tsx` | create | Desktop sidebar with 19 genres |
| `src/components/layout/CategorySidebar.test.tsx` | create | CategorySidebar component tests |
| `src/components/layout/Footer.tsx` | create | Footer with links and copyright |
| `src/components/layout/Footer.test.tsx` | create | Footer component tests |
| `src/components/layout/PageShell.tsx` | create | Layout wrapper combining all layout components |
| `src/components/layout/PageShell.test.tsx` | create | PageShell component tests |
| `src/components/ui/Drawer.tsx` | create | Slide-in drawer panel (from plan 02) |
| `src/components/ui/Drawer.test.tsx` | create | Drawer component tests |
| `src/lib/categories.ts` | create | Category data (19 genres) |
| `src/App.tsx` | modify | Wrap demo content in PageShell |

## Data

### Categories
```typescript
type Category = {
  id: string;
  name: string;
  handle: string;
};

const categories: Category[] = [
  { id: 'all', name: 'All', handle: 'all' },
  { id: 'romance', name: 'Romance', handle: 'romance' },
  { id: 'mystery-thriller', name: 'Mystery & Thriller', handle: 'mystery-thriller' },
  // ... 17 more categories
];
```

### Cart state (simulated for now)
```typescript
const [cartCount, setCartCount] = useState(0);
```

### Mobile menu state
```typescript
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
```

## States
- **Header**: 
  - Cart count badge (0 = hidden, >0 = show count)
  - Mobile menu open/closed
- **CategorySidebar**: 
  - Selected category (highlighted with `--layer-2` + left border)
  - Hover state on items
- **Drawer**: 
  - Closed, opening, open, closing (CSS transitions)
  - Focus trap when open
- **PageShell**: 
  - Manages mobile menu state
  - Passes down to Header and Drawer

## Responsive behaviour

### Breakpoints
- **sm (320px)**: Mobile layout, menu icon visible
- **md (672px)**: Nav links visible in header
- **lg (1056px)**: CategorySidebar visible, menu icon hidden
- **xlg (1312px)**: Max content width

### Header
- **< md**: Menu icon + logo on left, cart + profile on right. Nav links hidden (in mobile menu).
- **≥ md**: Menu icon + logo on left, nav links in center, cart + profile on right.
- **≥ lg**: Menu icon hidden, sidebar always visible.

### CategorySidebar
- **< lg**: Hidden, replaced by Drawer opened from menu icon.
- **≥ lg**: Fixed left sidebar, always visible, 240px wide.

### Drawer (mobile categories)
- **< lg**: Slides in from left when menu icon clicked.
- **≥ lg**: Not used (sidebar is visible).
- Overlay: `bg-black/50`, full screen.
- Panel: `bg-bg`, 80% width (max 320px), full height.
- Animation: 300ms ease-in-out slide.

### Footer
- **All sizes**: Full width, centered content, 16px padding.

### PageShell layout
```
< lg:
┌─────────────────┐
│     Header      │
├─────────────────┤
│                 │
│    Content      │
│                 │
├─────────────────┤
│     Footer      │
└─────────────────┘

≥ lg:
┌─────────────────────────────┐
│          Header             │
├──────┬──────────────────────┤
│      │                      │
│ Side │     Content          │
│ bar  │                      │
│      │                      │
├──────┴──────────────────────┤
│          Footer             │
└─────────────────────────────┘
```

## Accessibility
- **Header**:
  - Menu button: `aria-label="Open menu"`, `aria-expanded` state
  - Cart button: `aria-label="Cart (3 items)"` with count
  - Profile button: `aria-label="Profile"`
  - Nav links: Semantic `<nav>` with `<ul>` and `<li>`
- **CategorySidebar**:
  - Semantic `<nav>` with `aria-label="Categories"`
  - Selected item: `aria-current="page"`
  - Keyboard navigation (Tab, Enter)
- **Drawer**:
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby` for title
  - Focus trap when open
  - `Escape` to close
  - Focus returns to menu button on close
- **Footer**:
  - Semantic `<footer>` with links in `<nav>`
- **PageShell**:
  - Skip to main content link (hidden, visible on focus)
  - Proper heading hierarchy (h1 in page content)

## Tests
Each component requires:
1. **Render test**: Component renders without crashing
2. **Responsive test**: Correct elements shown/hidden at breakpoints
3. **Interaction test**: Clicks, keyboard navigation work
4. **Accessibility test**: ARIA attributes, roles, labels correct
5. **State test**: Selected category, cart count, drawer open/close

Example test structure:
```typescript
describe('Header', () => {
  it('renders logo and navigation', () => { ... });
  it('shows menu icon on mobile', () => { ... });
  it('hides menu icon on desktop', () => { ... });
  it('displays cart count badge', () => { ... });
  it('opens mobile menu on click', () => { ... });
  it('is keyboard accessible', () => { ... });
});
```

## Risks & open questions
1. **Cart count**: Where does it come from? For now, simulate with useState. Later integrate with cart feature.
2. **Profile icon**: Clicking should open a dropdown or navigate to profile. For now, just a button.
3. **Category selection**: How to persist selected category across navigation? Use URL params or context.
4. **Mobile menu content**: Should it include nav links + categories, or just categories? Wireframe shows menu icon, so assume both.
5. **Drawer animation**: CSS transitions vs Framer Motion? Prefer CSS for performance.

## Task checklist
- [ ] Create `src/lib/categories.ts` with 19 genre categories
- [ ] Implement Drawer component with tests (from plan 02)
- [ ] Implement Header component with tests
- [ ] Implement CategorySidebar component with tests
- [ ] Implement Footer component with tests
- [ ] Implement PageShell component with tests
- [ ] Update App.tsx to use PageShell
- [ ] Test responsive behavior at all breakpoints (320px, 672px, 1056px, 1312px)
- [ ] Verify drawer opens/closes on mobile
- [ ] Verify sidebar visible on desktop
- [ ] Run all tests and verify 100% pass
- [ ] Run typecheck and lint, fix any issues
- [ ] Take screenshots: mobile (drawer open/closed), tablet, desktop

---

## Component Specifications

### Header
```typescript
type HeaderProps = {
  cartCount?: number;
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
};
```
- Height: 64px
- Background: `bg-layer-1`
- Border bottom: `border-border`
- Layout: Flex, space-between, items-center
- Padding: 16px horizontal
- Menu icon: `<Menu size={24} />` (< lg only)
- Logo: "Book Worm" text, 20px bold
- Nav links: "My Orders · My Wishlist · My Writers" (≥ md)
- Cart: `<ShoppingCart size={24} />` with badge if count > 0
- Profile: `<UserAvatar size={24} />`

### CategorySidebar
```typescript
type CategorySidebarProps = {
  selectedCategory?: string;
  onCategorySelect: (categoryId: string) => void;
};
```
- Width: 240px
- Background: `bg-bg`
- Border right: `border-border`
- Fixed position on desktop (≥ lg)
- Hidden on mobile (< lg)
- Category items: 40px height, 14px text
- Selected: `bg-layer-2` + 3px left border `border-interactive`
- Hover: `bg-layer-2`

### Footer
```typescript
type FooterProps = Record<string, never>; // No props
```
- Background: `bg-layer-1`
- Border top: `border-border`
- Padding: 24px
- Centered content
- Links: About, Contact, Privacy, Terms (14px, `text-link`)
- Copyright: "© 2026 Book Worm" (12px, `text-text-secondary`)

### PageShell
```typescript
type PageShellProps = {
  children: React.ReactNode;
};
```
- Manages mobile menu state
- Renders Header, CategorySidebar (desktop), Drawer (mobile), Footer
- Main content area: Flex-grow, padding 24px
- Max width: 1584px (xlg breakpoint)

### Drawer
```typescript
type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom';
};
```
- Overlay: `fixed inset-0 bg-black/50 z-40`
- Panel: `fixed inset-y-0 bg-bg z-50`
  - Left: `left-0 w-[80%] max-w-[320px]`
  - Right: `right-0 w-[80%] max-w-[320px]`
  - Bottom: `bottom-0 h-[80%] max-h-[600px] w-full`
- Header: Title + close button (X icon)
- Content: Scrollable, padding 24px
- Animation: `transition-transform duration-300 ease-in-out`
  - Closed: `translate-x-[-100%]` (left), `translate-x-[100%]` (right), `translate-y-[100%]` (bottom)
  - Open: `translate-x-0` or `translate-y-0`
- Focus trap: Use `focus-trap-react` or manual implementation
- Close on: Overlay click, Escape key, close button click
