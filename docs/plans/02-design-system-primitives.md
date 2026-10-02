# 02 — Design System UI Primitives

## Goal
Build the foundational UI components in `src/components/ui/` that implement IBM Carbon Design System principles using Tailwind utilities. These primitives will be used across all screens.

## Wireframe reference
All wireframes (`01-home-catalogue.png` through `05-purchase-success.png`) show these components in use:
- Buttons (primary, secondary)
- Text inputs with labels
- Select dropdowns
- Checkboxs
- Tags (categories, format badges)
- Breadcrumbs
- Rating stars
- Price display
- Quantity steppers
- Loading skeletons
- Empty/error states
- Tabs (payment methods)
- Drawer (mobile category sidebar)

## Component tree
All components are new, reusable primitives:
- `Button` (new) - Primary, secondary, icon variants
- `TextInput` (new) - Label, error state, optional icon
- `Select` (new) - Dropdown with label
- `Checkbox` (new) - With label
- `Tag` (new) - Category/format badges
- `Breadcrumb` (new) - Navigation path
- `RatingStars` (new) - Display and input modes
- `Price` (new) - Formatted INR display
- `QuantityStepper` (new) - +/- controls
- `Skeleton` (new) - Loading placeholder
- `EmptyState` (new) - No results/items
- `ErrorState` (new) - Error with retry
- `Tabs` (new) - Horizontal tab navigation
- `Drawer` (new) - Slide-in panel (mobile)

## Files

| Path | Action | Purpose |
|------|--------|---------|
| `src/lib/utils.ts` | create | `cn()` helper (clsx + tailwind-merge) |
| `src/lib/formatters.ts` | create | Currency and date formatting utilities |
| `src/components/ui/Button.tsx` | create | Primary/secondary button with icon support |
| `src/components/ui/Button.test.tsx` | create | Button component tests |
| `src/components/ui/TextInput.tsx` | create | Text input with label and error state |
| `src/components/ui/TextInput.test.tsx` | create | TextInput component tests |
| `src/components/ui/Select.tsx` | create | Select dropdown with label |
| `src/components/ui/Select.test.tsx` | create | Select component tests |
| `src/components/ui/Checkbox.tsx` | create | Checkbox with label |
| `src/components/ui/Checkbox.test.tsx` | create | Checkbox component tests |
| `src/components/ui/Tag.tsx` | create | Badge/tag for categories and formats |
| `src/components/ui/Tag.test.tsx` | create | Tag component tests |
| `src/components/ui/Breadcrumb.tsx` | create | Navigation breadcrumb |
| `src/components/ui/Breadcrumb.test.tsx` | create | Breadcrumb component tests |
| `src/components/ui/RatingStars.tsx` | create | Star rating display and input |
| `src/components/ui/RatingStars.test.tsx` | create | RatingStars component tests |
| `src/components/ui/Price.tsx` | create | Formatted price display |
| `src/components/ui/Price.test.tsx` | create | Price component tests |
| `src/components/ui/QuantityStepper.tsx` | create | Quantity +/- controls |
| `src/components/ui/QuantityStepper.test.tsx` | create | QuantityStepper component tests |
| `src/components/ui/Skeleton.tsx` | create | Loading skeleton placeholder |
| `src/components/ui/Skeleton.test.tsx` | create | Skeleton component tests |
| `src/components/ui/EmptyState.tsx` | create | Empty state with icon and CTA |
| `src/components/ui/EmptyState.test.tsx` | create | EmptyState component tests |
| `src/components/ui/ErrorState.tsx` | create | Error state with retry button |
| `src/components/ui/ErrorState.test.tsx` | create | ErrorState component tests |
| `src/components/ui/Tabs.tsx` | create | Horizontal tab navigation |
| `src/components/ui/Tabs.test.tsx` | create | Tabs component tests |
| `src/components/ui/Drawer.tsx` | create | Slide-in drawer panel |
| `src/components/ui/Drawer.test.tsx` | create | Drawer component tests |
| `src/components/ui/index.ts` | create | Barrel export for all UI components |

## Data
N/A - These are pure UI components with no data fetching.

## States
Each component handles its own internal states:
- **Button**: default, hover, focus, disabled, loading
- **TextInput**: default, focus, error, disabled
- **Select**: closed, open, focus, disabled
- **Checkbox**: unchecked, checked, indeterminate, disabled
- **RatingStars**: display mode (read-only), input mode (interactive)
- **QuantityStepper**: enabled, disabled (at min/max)
- **Drawer**: closed, opening, open, closing

## Responsive behaviour
- **Button**: Height 48px on all sizes. Icon-only variant on mobile where space is tight.
- **TextInput/Select**: Full width on mobile, constrained width on desktop.
- **Tabs**: Horizontal scroll on mobile if tabs overflow.
- **Drawer**: Full-screen overlay on mobile, partial overlay on tablet/desktop.
- **Touch targets**: All interactive elements ≥ 44px for mobile.

## Accessibility
- **Button**: `<button>` element, disabled state, loading state with `aria-busy`, icon-only has `aria-label`.
- **TextInput**: `<label>` with `htmlFor`, error linked via `aria-describedby`, `aria-invalid` when error.
- **Select**: Native `<select>` for accessibility, `<label>` with `htmlFor`.
- **Checkbox**: Native `<input type="checkbox">`, `<label>` with `htmlFor`.
- **RatingStars**: Input mode uses radio buttons with labels, display mode has `aria-label`.
- **QuantityStepper**: Buttons have `aria-label`, input has `aria-label`, min/max announced.
- **Drawer**: Focus trap when open, `Escape` to close, `aria-modal="true"`, focus returns to trigger on close.
- **Tabs**: `role="tablist"`, `role="tab"`, `role="tabpanel"`, keyboard navigation (Arrow keys, Home, End).
- **EmptyState/ErrorState**: Heading for screen readers, CTA button is keyboard accessible.
- **All components**: 2px focus ring (`--focus`), respect `prefers-reduced-motion`.

## Tests
Each component requires:
1. **Render test**: Component renders without crashing
2. **Props test**: All variants/states render correctly
3. **Interaction test**: Click, keyboard, focus work as expected
4. **Accessibility test**: Roles, labels, ARIA attributes are correct
5. **Edge cases**: Disabled state, loading state, error state

Example test structure:
```typescript
describe('Button', () => {
  it('renders primary button', () => { ... });
  it('renders secondary button', () => { ... });
  it('handles click events', () => { ... });
  it('shows loading state', () => { ... });
  it('is keyboard accessible', () => { ... });
  it('has correct ARIA attributes', () => { ... });
});
```

## Risks & open questions
1. **Carbon icons**: Confirm which specific icons are needed from `@carbon/icons-react` for each component.
2. **Drawer animation**: Need to decide on animation library or use CSS transitions. Prefer CSS for performance.
3. **Select component**: Native `<select>` vs custom dropdown. Start with native for accessibility, can enhance later.
4. **RatingStars input**: Confirm UX for half-star ratings (if needed) or stick to whole stars.
5. **QuantityStepper**: Confirm min/max values and step increment (default 1).

## Task checklist
- [ ] Create `src/lib/utils.ts` with `cn()` helper
- [ ] Create `src/lib/formatters.ts` with currency and date formatters
- [ ] Implement Button component with tests
- [ ] Implement TextInput component with tests
- [ ] Implement Select component with tests
- [ ] Implement Checkbox component with tests
- [ ] Implement Tag component with tests
- [ ] Implement Breadcrumb component with tests
- [ ] Implement RatingStars component with tests
- [ ] Implement Price component with tests
- [ ] Implement QuantityStepper component with tests
- [ ] Implement Skeleton component with tests
- [ ] Implement EmptyState component with tests
- [ ] Implement ErrorState component with tests
- [ ] Implement Tabs component with tests
- [ ] Implement Drawer component with tests
- [ ] Create barrel export `src/components/ui/index.ts`
- [ ] Run all tests and verify 100% pass
- [ ] Run typecheck and lint, fix any issues
- [ ] Update App.tsx to showcase all components (temporary demo page)
- [ ] Take screenshots of all components in both themes

---

## Component Specifications

### Button
```typescript
type ButtonProps = {
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'small';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
```
- Primary: `bg-interactive hover:bg-interactive-hover text-white`
- Secondary: `bg-button-secondary hover:bg-layer-2 text-text-primary`
- Height: 48px (default), 40px (small)
- Icon: 20px, positioned left or right of label
- Loading: Show spinner, disable interaction

### TextInput
```typescript
type TextInputProps = {
  label: string;
  error?: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;
```
- Label: 12px `text-text-secondary` above input
- Input: `bg-layer-1 border-b border-border h-48 px-16`
- Error: Red border, error text below in `text-support-error`
- Focus: 2px `ring-focus`

### Select
```typescript
type SelectProps = {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;
```
- Native `<select>` styled to match TextInput
- Dropdown icon (chevron down) on the right

### Checkbox
```typescript
type CheckboxProps = {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;
```
- Native `<input type="checkbox">` with custom styling
- Checkmark icon when checked
- 20px × 20px box

### Tag
```typescript
type TagProps = {
  children: React.ReactNode;
  variant?: 'default' | 'category' | 'format';
};
```
- Default: `bg-layer-2 text-text-primary px-8 py-4 text-12`
- Category: Link style with `text-link underline`
- Format: Badge style, no underline

### Breadcrumb
```typescript
type BreadcrumbProps = {
  items: { label: string; href?: string }[];
};
```
- Items separated by `/` or `>` icon
- Last item is not a link (current page)
- Links: `text-link underline`

### RatingStars
```typescript
type RatingStarsProps = {
  rating: number; // 0-5
  onChange?: (rating: number) => void; // If provided, input mode
  size?: 'small' | 'default';
};
```
- Display mode: Read-only stars (filled/empty)
- Input mode: Clickable stars (radio buttons)
- Color: `text-rating` (yellow)
- Size: 16px (small), 20px (default)

### Price
```typescript
type PriceProps = {
  amount: number; // In INR
  size?: 'default' | 'large';
  showDecimals?: boolean;
};
```
- Format: `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`
- Default: No decimals ("₹399")
- Large: 20px bold
- Totals: 2 decimals ("₹508.00")

### QuantityStepper
```typescript
type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};
```
- Layout: `[−] [value] [+]`
- Buttons: 40px × 40px, `bg-layer-1`
- Disabled at min/max
- Optimistic updates

### Skeleton
```typescript
type SkeletonProps = {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
};
```
- Animated shimmer effect
- `bg-layer-1` with gradient animation
- Matches layout of actual content

### EmptyState
```typescript
type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
};
```
- Centered layout
- Icon: 48px, `text-text-secondary`
- Title: 20px
- Description: 14px `text-text-secondary`
- Action: Primary button

### ErrorState
```typescript
type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};
```
- Similar to EmptyState but with error icon
- Default title: "Something went wrong"
- Retry button if `onRetry` provided

### Tabs
```typescript
type TabsProps = {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
};
```
- Horizontal tab list
- Active tab: 3px bottom border `border-interactive`
- Content panel below tabs
- Keyboard navigation (Arrow keys)

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
- Overlay: `bg-black/50`
- Panel: `bg-bg` slides in from position
- Close button (X icon) in header
- Focus trap when open
- `Escape` to close
