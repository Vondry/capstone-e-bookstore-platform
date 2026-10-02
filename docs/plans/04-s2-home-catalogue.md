# 04 — S2 Home/Catalogue Screen

## Goal
Implement the Home/Catalogue screen (S2) from wireframe `01-home-catalogue.png`: filter bar, book cards in 3-column grid, sections for Recommended/Bestsellers/New Launches, and integration with category sidebar. This is the main landing page and category browsing experience.

## Wireframe reference
**File:** `01-home-catalogue.png`

**Layout observations:**
- Header (from plan 03) at top
- CategorySidebar (from plan 03) on left ≥ lg
- Main content area with:
  - Filter bar: Search input, Language dropdown, Format dropdown, Price range, Sort dropdown
  - Book grid: 3 columns (xlg), 2 columns (md-lg), 1 column (sm)
  - Sections with headings: "Recommended for You", "Bestsellers this Month", "New Launches"
  - Each section shows ~6-9 books in grid

**Book card observations (horizontal layout):**
- Left: Book cover (120-144px wide, 2:3 ratio)
- Right: 
  - Title (20px, bold, 2 lines max)
  - "by {author}" (14px, link, underlined)
  - Description (14px, 2 lines, text-secondary)
  - Format badge (e.g., "Paperback")
  - Category links (e.g., "Romance · Fiction")
  - Price (20px, bold) + Delivery estimate (14px, "Delivery by Mon, 21 Jul")
- Height: ~200px
- Background: layer-1
- Hover: layer-2

**Filter bar observations:**
- Height: ~56px
- Background: layer-1
- 5 controls in a row (wraps on mobile):
  - Search: TextInput with search icon, placeholder "Search you want to read here"
  - Language: Select dropdown
  - Format: Select dropdown
  - Price Range: Two inputs (Min/Max) or slider
  - Sort by: Select dropdown (Relevance, Price ↑, Price ↓, Newest, Bestselling)
- All filters sync to URL search params

**Sections:**
- "Recommended for You": Only shown when logged in and has orders
- "Bestsellers this Month": Always shown
- "New Launches": Always shown
- When filters/search active: Replace sections with single "Results" grid + count

## Component tree
- `PageShell` (from plan 03)
  - `Header` (from plan 03)
  - `CategorySidebar` (from plan 03)
  - `HomePage` (new) - Main page component
    - `FilterBar` (new) - Search and filter controls
    - `BookGrid` (new) - Grid of book cards
      - `BookCard` (new) - Horizontal book card
    - `EmptyState` (reuse from plan 02) - No results
    - `ErrorState` (reuse from plan 02) - Error loading books
    - `Skeleton` (reuse from plan 02) - Loading state

## Files

| Path | Action | Purpose |
|------|--------|---------|
| `src/features/catalog/types.ts` | create | Book, Author, Publisher, Category types |
| `src/features/catalog/api.ts` | create | Medusa SDK calls for books (or mocked) |
| `src/features/catalog/hooks/useBooks.ts` | create | TanStack Query hook for fetching books |
| `src/features/catalog/hooks/useFilters.ts` | create | Hook for managing filter state + URL sync |
| `src/features/catalog/mappers.ts` | create | Map Medusa DTOs to domain types |
| `src/features/catalog/lib/filters.ts` | create | Pure functions for filtering/sorting books |
| `src/features/catalog/components/FilterBar.tsx` | create | Filter controls bar |
| `src/features/catalog/components/FilterBar.test.tsx` | create | FilterBar tests |
| `src/features/catalog/components/BookCard.tsx` | create | Horizontal book card |
| `src/features/catalog/components/BookCard.test.tsx` | create | BookCard tests |
| `src/features/catalog/components/BookGrid.tsx` | create | Responsive grid of book cards |
| `src/features/catalog/components/BookGrid.test.tsx` | create | BookGrid tests |
| `src/pages/HomePage.tsx` | create | S2 Home/Catalogue page |
| `src/pages/HomePage.test.tsx` | create | HomePage tests |
| `src/mocks/handlers/books.ts` | create | MSW handlers for book API |
| `src/mocks/data/books.ts` | create | Mock book data (20-30 books) |
| `src/App.tsx` | modify | Add route for HomePage |

## Data

### Book type (domain model)
```typescript
type Book = {
  id: string;
  handle: string;
  title: string;
  subtitle?: string;
  author: {
    name: string;
    slug: string;
  };
  publisher?: {
    name: string;
    slug: string;
  };
  description: string;
  format: 'Paperback' | 'Hardcover' | 'eBook';
  categories: {
    name: string;
    handle: string;
  }[];
  language: string;
  priceInr: number;
  coverUrl: string;
  backCoverUrl?: string;
  rating?: number; // 0-5
  soldCount?: number;
  variantId: string;
};
```

### Filter state
```typescript
type Filters = {
  search: string;
  language: string; // 'all' | 'english' | 'hindi' | ...
  format: string; // 'all' | 'paperback' | 'hardcover' | 'ebook'
  priceMin: number;
  priceMax: number;
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'bestselling';
  category: string; // from URL or sidebar
};
```

### API calls (Medusa SDK or mocked)
```typescript
// src/features/catalog/api.ts
export async function fetchBooks(filters: Filters): Promise<Book[]> {
  // If Medusa backend available:
  // const { products } = await sdk.store.product.list({ ... });
  // return products.map(mapProductToBook);
  
  // For now, return mock data filtered client-side
  return mockBooks.filter(/* apply filters */);
}
```

## States
- **Loading**: Show skeleton cards (6-9 skeletons in grid)
- **Empty**: No books match filters → EmptyState with "No books found" + clear filters button
- **Error**: API error → ErrorState with retry button
- **Success**: Display books in grid
- **Filters active**: Show result count + clear filters button

## Responsive behaviour

### Filter bar
- **≥ lg**: All 5 controls in one row
- **md**: Wraps to 2 rows (search full width, 4 controls below)
- **sm**: Search full width + "Filters" button → opens bottom sheet with all filter controls

### Book grid
- **xlg (≥1312px)**: 3 columns
- **md-lg (672-1312px)**: 2 columns
- **sm (<672px)**: 1 column

### Book card
- **All sizes**: Horizontal layout (cover left, info right)
- **sm**: Cover 120px, title 16px, description 1 line
- **md+**: Cover 144px, title 20px, description 2 lines

## Accessibility
- **FilterBar**: 
  - All inputs have labels (visible or aria-label)
  - Clear filters button: `aria-label="Clear all filters"`
  - Result count: `aria-live="polite"` region
- **BookCard**:
  - Cover image: `alt="{title} by {author} — cover"`
  - Author link: Underlined, keyboard accessible
  - Category links: Keyboard accessible
  - Whole card clickable: Wrap in `<Link>` or use `onClick` with keyboard support
- **BookGrid**:
  - Semantic `<section>` with heading for each section
  - Loading: `aria-busy="true"` on grid
- **HomePage**:
  - Page title: `<h1>` (hidden if using sections)
  - Skip to content link (from PageShell)

## Tests
Each component requires:
1. **FilterBar**: Renders all controls, updates URL on change, clears filters
2. **BookCard**: Renders book info, links work, hover state, responsive
3. **BookGrid**: Renders books in grid, responsive columns, loading/empty/error states
4. **HomePage**: Fetches books, applies filters, shows sections, handles errors

Example test structure:
```typescript
describe('HomePage', () => {
  it('renders filter bar and book grid', () => { ... });
  it('fetches books on mount', () => { ... });
  it('applies filters from URL', () => { ... });
  it('shows recommended section when logged in', () => { ... });
  it('shows empty state when no results', () => { ... });
  it('shows error state on API failure', () => { ... });
});
```

## Risks & open questions
1. **Medusa backend**: Is it running? If not, use mock data for now. Mark with `// SIMULATED:` comment.
2. **Book images**: Where do cover images come from? Use placeholder images initially.
3. **Recommended section**: Requires user orders. Simulate with localStorage or hide for now.
4. **Price range**: Slider or two inputs? Start with two inputs (simpler).
5. **Filter persistence**: Should filters persist across navigation? Use URL params only for now.
6. **Pagination**: Wireframe doesn't show pagination. Load all books or implement infinite scroll? Start with all books (limit to 50).

## Task checklist
- [ ] Create domain types (Book, Author, Publisher, Category)
- [ ] Create mock book data (20-30 books across categories)
- [ ] Create MSW handlers for book API
- [ ] Implement useBooks hook with TanStack Query
- [ ] Implement useFilters hook with URL sync
- [ ] Implement FilterBar component with tests
- [ ] Implement BookCard component with tests
- [ ] Implement BookGrid component with tests
- [ ] Implement HomePage with all sections
- [ ] Add route to App.tsx
- [ ] Test responsive behavior at all breakpoints
- [ ] Test filter combinations
- [ ] Test loading/empty/error states
- [ ] Run all tests and verify pass
- [ ] Run typecheck and lint
- [ ] Take screenshots: mobile, tablet, desktop

---

## Component Specifications

### FilterBar
```typescript
type FilterBarProps = {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  resultCount?: number;
};
```
- Layout: Flex row, wraps on mobile
- Search: Full width on mobile, 40% on desktop
- Dropdowns: 15% each on desktop
- Clear button: Only shown when filters active
- Result count: "Showing 24 books" (text-secondary)

### BookCard
```typescript
type BookCardProps = {
  book: Book;
  onClick?: () => void;
};
```
- Layout: Flex row, gap 16px
- Cover: 120-144px wide, 2:3 ratio, object-fit cover
- Info: Flex column, gap 8px
- Title: 20px bold, 2 lines, ellipsis
- Author: 14px link, underlined
- Description: 14px, 2 lines, ellipsis, text-secondary
- Format: Tag component (from plan 02)
- Categories: Tag components, comma-separated
- Price: 20px bold + delivery (14px, text-secondary)
- Hover: bg-layer-2, cursor pointer

### BookGrid
```typescript
type BookGridProps = {
  books: Book[];
  loading?: boolean;
  error?: Error;
  emptyMessage?: string;
};
```
- Grid: 1/2/3 columns based on breakpoint
- Gap: 24px
- Loading: Show 6 skeleton cards
- Empty: EmptyState component
- Error: ErrorState component with retry

### HomePage
```typescript
// No props, uses hooks internally
```
- Fetches books on mount
- Reads filters from URL
- Shows sections when no filters active
- Shows results grid when filters active
- Handles loading/empty/error states
- Updates document title: "Book Worm"

## Mock Data Structure
```typescript
// src/mocks/data/books.ts
export const mockBooks: Book[] = [
  {
    id: '1',
    handle: 'the-midnight-library',
    title: 'The Midnight Library',
    author: { name: 'Matt Haig', slug: 'matt-haig' },
    description: 'Between life and death there is a library...',
    format: 'Paperback',
    categories: [
      { name: 'Fiction', handle: 'fiction' },
      { name: 'Fantasy', handle: 'fantasy' },
    ],
    language: 'English',
    priceInr: 399,
    coverUrl: '/covers/midnight-library.jpg',
    rating: 4.5,
    soldCount: 1250,
    variantId: 'variant_1',
  },
  // ... 19-29 more books
];
```

## URL Structure
```
/ → Home with all sections
/?category=romance → Romance category
/?search=harry → Search results
/?format=ebook&sortBy=price-asc → Filtered results
```

## Integration with CategorySidebar
- CategorySidebar passes `category` to URL
- HomePage reads `category` from URL
- Selected category highlighted in sidebar
- Clicking "All" clears category filter
