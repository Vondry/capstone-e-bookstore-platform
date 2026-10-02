/**
 * TanStack Query hooks for writers and publishers
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchBooksByBrand,
  fetchPublisher,
  fetchPublishers,
  fetchWriters,
  type BrandFilter,
} from '../api';

export const brandQueryKeys = {
  all: ['brands'] as const,
  writers: () => [...brandQueryKeys.all, 'writers'] as const,
  publishers: () => [...brandQueryKeys.all, 'publishers'] as const,
  publisher: (slug: string) => [...brandQueryKeys.all, 'publisher', slug] as const,
  books: (filter: BrandFilter) => [...brandQueryKeys.all, 'books', filter] as const,
};

const TEN_MINUTES = 10 * 60 * 1000;

export function useWriters() {
  return useQuery({
    queryKey: brandQueryKeys.writers(),
    queryFn: fetchWriters,
    staleTime: TEN_MINUTES,
  });
}

export function usePublishers() {
  return useQuery({
    queryKey: brandQueryKeys.publishers(),
    queryFn: fetchPublishers,
    staleTime: TEN_MINUTES,
  });
}

export function usePublisher(slug: string) {
  return useQuery({
    queryKey: brandQueryKeys.publisher(slug),
    queryFn: () => fetchPublisher(slug),
    staleTime: TEN_MINUTES,
  });
}

export function useBooksByBrand(filter: BrandFilter) {
  return useQuery({
    queryKey: brandQueryKeys.books(filter),
    queryFn: () => fetchBooksByBrand(filter),
    staleTime: TEN_MINUTES,
  });
}
