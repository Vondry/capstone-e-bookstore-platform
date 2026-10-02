/**
 * Hook for managing filter state with URL synchronization
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMatch, useNavigate, useSearchParams } from 'react-router-dom';
import type { Filters } from '../types';
import { DEFAULT_FILTERS } from '../types';

/**
 * Parse filters from URL search params. The `/category/:handle` route wins over `?category=`.
 */
function parseFiltersFromUrl(searchParams: URLSearchParams, routeCategory?: string): Filters {
  const priceMinParam = searchParams.get('priceMin');
  const priceMaxParam = searchParams.get('priceMax');
  const sortByParam = searchParams.get('sortBy');

  return {
    search: searchParams.get('search') ?? DEFAULT_FILTERS.search,
    language: searchParams.get('language') ?? DEFAULT_FILTERS.language,
    format: searchParams.get('format') ?? DEFAULT_FILTERS.format,
    priceMin: priceMinParam ? Number(priceMinParam) : DEFAULT_FILTERS.priceMin,
    priceMax: priceMaxParam ? Number(priceMaxParam) : DEFAULT_FILTERS.priceMax,
    sortBy: sortByParam ? (sortByParam as Filters['sortBy']) : DEFAULT_FILTERS.sortBy,
    category: routeCategory ?? searchParams.get('category') ?? DEFAULT_FILTERS.category,
  };
}

/**
 * Convert filters to URL search params (category lives in the path, see `filtersToLocation`)
 */
function filtersToSearchParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.language !== 'all') params.set('language', filters.language);
  if (filters.format !== 'all') params.set('format', filters.format);
  if (filters.priceMin > 0) params.set('priceMin', filters.priceMin.toString());
  if (filters.priceMax < 10000) params.set('priceMax', filters.priceMax.toString());
  if (filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy);

  return params;
}

/**
 * Category goes into the path (`/category/:handle`), everything else into the query string
 */
function filtersToLocation(filters: Filters) {
  return {
    pathname:
      filters.category === 'all' ? '/' : `/category/${encodeURIComponent(filters.category)}`,
    search: filtersToSearchParams(filters).toString(),
  };
}

export function useFilters() {
  const [searchParams] = useSearchParams();
  const categoryMatch = useMatch('/category/:handle');
  const routeCategory = categoryMatch?.params.handle;
  const navigate = useNavigate();

  // Parse current filters from URL
  const filters = useMemo(
    () => parseFiltersFromUrl(searchParams, routeCategory),
    [searchParams, routeCategory]
  );

  // Check if any filters are active (not default)
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== DEFAULT_FILTERS.search ||
      filters.language !== DEFAULT_FILTERS.language ||
      filters.format !== DEFAULT_FILTERS.format ||
      filters.priceMin !== DEFAULT_FILTERS.priceMin ||
      filters.priceMax !== DEFAULT_FILTERS.priceMax ||
      filters.sortBy !== DEFAULT_FILTERS.sortBy ||
      filters.category !== DEFAULT_FILTERS.category
    );
  }, [filters]);

  // Filters navigated to but not rendered yet: a second change before the URL updates
  // (e.g. price range, then sort) must build on the first one instead of on stale filters
  const pending = useRef<Filters | null>(null);
  useEffect(() => {
    pending.current = null;
  }, [filters]);

  // Update filters (partial update)
  const updateFilters = useCallback(
    (updates: Partial<Filters>) => {
      const newFilters = { ...(pending.current ?? filters), ...updates };
      pending.current = newFilters;
      void navigate(filtersToLocation(newFilters), { replace: true });
    },
    [filters, navigate]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    pending.current = DEFAULT_FILTERS;
    void navigate('/', { replace: true });
  }, [navigate]);

  // Set a single filter
  const setFilter = useCallback(
    (key: keyof Filters, value: Filters[keyof Filters]) => {
      updateFilters({ [key]: value });
    },
    [updateFilters]
  );

  return {
    filters,
    hasActiveFilters,
    updateFilters,
    clearFilters,
    setFilter,
  };
}
