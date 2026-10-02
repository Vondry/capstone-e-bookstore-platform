/**
 * TanStack Query hook for fetching books
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Filters } from '../types';
import { fetchBooks, fetchBestsellers, fetchNewLaunches } from '../api';

export const bookQueryKeys = {
  all: ['books'] as const,
  lists: () => [...bookQueryKeys.all, 'list'] as const,
  list: (filters: Partial<Filters>) => [...bookQueryKeys.lists(), filters] as const,
  bestsellers: () => [...bookQueryKeys.all, 'bestsellers'] as const,
  newLaunches: () => [...bookQueryKeys.all, 'new'] as const,
};

/**
 * Hook to fetch books with filters
 */
export function useBooks(filters: Partial<Filters> = {}) {
  return useQuery({
    queryKey: bookQueryKeys.list(filters),
    queryFn: () => fetchBooks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Keep showing the previous results while new filters load, instead of flashing skeletons
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook to fetch bestselling books
 */
export function useBestsellers() {
  return useQuery({
    queryKey: bookQueryKeys.bestsellers(),
    queryFn: fetchBestsellers,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch new launches
 */
export function useNewLaunches() {
  return useQuery({
    queryKey: bookQueryKeys.newLaunches(),
    queryFn: fetchNewLaunches,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
