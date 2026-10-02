/**
 * HomePage - S2 Home/Catalogue screen
 */

import { useEffect } from 'react';
import { FilterBar } from '../features/catalog/components/FilterBar';
import { BookGrid } from '../features/catalog/components/BookGrid';
import { useFilters } from '../features/catalog/hooks/useFilters';
import { useBooks, useBestsellers, useNewLaunches } from '../features/catalog/hooks/useBooks';
import { useRecommendations } from '../features/recommendations/hooks/useRecommendations';
import { categoryName as findCategoryName } from '../lib/categories';

export function HomePage() {
  const { filters, hasActiveFilters, updateFilters, clearFilters } = useFilters();

  // Fetch books based on filters
  const {
    data: filteredBooks,
    isLoading: isLoadingFiltered,
    error: errorFiltered,
    refetch: refetchFiltered,
  } = useBooks(hasActiveFilters ? filters : undefined);

  // Fetch section data (only when no filters active)
  // Only for logged-in customers with orders (.bob/rules/03-screens.md → S2)
  const recommendations = useRecommendations();
  const showRecommended = recommendations.hasOrderHistory && recommendations.isPersonal;
  const bestsellers = useBestsellers();
  const newLaunches = useNewLaunches();

  const categoryName = findCategoryName(filters.category);

  // Update document title
  useEffect(() => {
    document.title = `${categoryName ?? 'Home'} · Book Worm`;
  }, [categoryName]);

  // Show filtered results when filters are active
  if (hasActiveFilters) {
    return (
      <div className="space-y-24">
        <FilterBar
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          resultCount={filteredBooks?.length}
          hasActiveFilters={hasActiveFilters}
        />

        <section>
          <h1 className="mb-16 text-20 font-normal text-text-primary">
            {categoryName ?? 'Search Results'}
          </h1>
          <BookGrid
            books={filteredBooks ?? []}
            loading={isLoadingFiltered}
            error={errorFiltered ?? undefined}
            onRetry={() => void refetchFiltered()}
            emptyMessage="No books match your filters"
          />
        </section>
      </div>
    );
  }

  // Show sections when no filters active
  return (
    <div className="space-y-32">
      <FilterBar
        filters={filters}
        onFiltersChange={updateFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {showRecommended && (
        <section>
          <h1 className="mb-16 text-20 font-normal text-text-primary">Recommended for You</h1>
          <BookGrid books={recommendations.books} emptyMessage="No recommendations available" />
        </section>
      )}

      {/* Bestsellers this Month */}
      <section>
        {showRecommended ? (
          <h2 className="mb-16 text-20 font-normal text-text-primary">Bestsellers this Month</h2>
        ) : (
          <h1 className="mb-16 text-20 font-normal text-text-primary">Bestsellers this Month</h1>
        )}
        <BookGrid
          books={bestsellers.data ?? []}
          loading={bestsellers.isLoading}
          error={bestsellers.error ?? undefined}
          onRetry={() => void bestsellers.refetch()}
          cardHeadingLevel={showRecommended ? 'h3' : 'h2'}
          emptyMessage="No bestsellers available"
        />
      </section>

      {/* New Launches */}
      <section>
        <h2 className="mb-16 text-20 font-normal text-text-primary">New Launches</h2>
        <BookGrid
          books={newLaunches.data ?? []}
          loading={newLaunches.isLoading}
          error={newLaunches.error ?? undefined}
          onRetry={() => void newLaunches.refetch()}
          cardHeadingLevel="h3"
          emptyMessage="No new launches available"
        />
      </section>
    </div>
  );
}
