/**
 * FilterBar component - Search and filter controls
 */

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Close } from '@carbon/icons-react';
import { FilterSearch, FilterSelect } from './FilterTile';
import type { Filters } from '../types';

export type FilterBarProps = {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  onClearFilters?: () => void;
  resultCount?: number;
  hasActiveFilters?: boolean;
};

/** How long typing must pause before the search is applied */
export const SEARCH_DEBOUNCE_MS = 300;

const languageOptions = [
  { value: 'all', label: 'All' },
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
];

const formatOptions = [
  { value: 'all', label: 'All' },
  { value: 'paperback', label: 'Paperback' },
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'ebook', label: 'eBook' },
];

const priceRanges = [
  { value: 'all', label: 'All', min: 0, max: 10000 },
  { value: 'under-200', label: 'Under ₹200', min: 0, max: 199 },
  { value: '200-400', label: '₹200 – ₹400', min: 200, max: 400 },
  { value: '400-600', label: '₹400 – ₹600', min: 400, max: 600 },
  { value: 'over-600', label: 'Over ₹600', min: 600, max: 10000 },
];

const priceRangeOptions = priceRanges.map(({ value, label }) => ({ value, label }));

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'newest', label: 'Newest' },
  { value: 'bestselling', label: 'Bestselling' },
];

function priceRangeValue(filters: Filters): string {
  const range = priceRanges.find(
    ({ min, max }) => min === filters.priceMin && max === filters.priceMax
  );
  return range?.value ?? 'all';
}

export function FilterBar({
  filters,
  onFiltersChange,
  onClearFilters,
  resultCount,
  hasActiveFilters,
}: Readonly<FilterBarProps>) {
  // The input keeps its own value so typing stays instant; the search filter (URL + query)
  // only updates once typing pauses, instead of refetching and re-rendering on every key.
  const [searchInput, setSearchInput] = useState(filters.search);
  const lastSubmittedSearch = useRef(filters.search);
  const submitSearch = useEffectEvent((search: string) => {
    onFiltersChange({ search });
  });

  // Sync when the search changes from outside (Clear Filters, back/forward navigation)
  useEffect(() => {
    if (filters.search !== lastSubmittedSearch.current) {
      lastSubmittedSearch.current = filters.search;
      setSearchInput(filters.search);
    }
  }, [filters.search]);

  useEffect(() => {
    if (searchInput === lastSubmittedSearch.current) return;

    const timeout = setTimeout(() => {
      lastSubmittedSearch.current = searchInput;
      submitSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput]);

  return (
    <div className="space-y-16">
      {/* Filter controls: one row ≥ lg, search + 4 controls below on md */}
      <div className="grid grid-cols-1 gap-16 md:grid-cols-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div className="md:col-span-4 lg:col-span-1">
          <FilterSearch
            label="Search you want to read here"
            placeholder="Search"
            value={searchInput}
            onChange={setSearchInput}
          />
        </div>

        <FilterSelect
          label="Language"
          options={languageOptions}
          value={filters.language}
          onChange={(language) => {
            onFiltersChange({ language });
          }}
        />

        <FilterSelect
          label="Format (Paperback, ebook etc)"
          options={formatOptions}
          value={filters.format}
          onChange={(format) => {
            onFiltersChange({ format });
          }}
        />

        <FilterSelect
          label="Price Range"
          options={priceRangeOptions}
          value={priceRangeValue(filters)}
          onChange={(value) => {
            const range = priceRanges.find((r) => r.value === value);
            if (range) onFiltersChange({ priceMin: range.min, priceMax: range.max });
          }}
        />

        <FilterSelect
          label="Sort by"
          options={sortOptions}
          value={filters.sortBy}
          onChange={(sortBy) => {
            onFiltersChange({ sortBy: sortBy as Filters['sortBy'] });
          }}
        />
      </div>

      {/* Result count and clear filters */}
      {(resultCount !== undefined || hasActiveFilters) && (
        <div className="flex items-center justify-between">
          {resultCount !== undefined && (
            <p className="text-14 text-text-secondary" role="status" aria-live="polite">
              Showing {resultCount} {resultCount === 1 ? 'book' : 'books'}
            </p>
          )}
          {hasActiveFilters && onClearFilters && (
            <Button
              variant="secondary"
              size="small"
              icon={<Close size={16} />}
              onClick={onClearFilters}
              aria-label="Clear all filters"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
