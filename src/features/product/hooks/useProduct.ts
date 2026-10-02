/**
 * TanStack Query hooks for the product detail screen (S3)
 */

import { useQuery } from '@tanstack/react-query';
import { fetchBooks } from '../../catalog/api';
import type { Book } from '../../catalog/types';
import { fetchProduct, fetchWriter } from '../api';
import { pickRelatedBooks, relatedCategory } from '../lib/related';

export const productQueryKeys = {
  all: ['product'] as const,
  detail: (handle: string) => [...productQueryKeys.all, 'detail', handle] as const,
  related: (handle: string) => [...productQueryKeys.all, 'related', handle] as const,
  writer: (slug: string) => [...productQueryKeys.all, 'writer', slug] as const,
};

/** `data` is the book, or null when the handle does not exist */
export function useProduct(handle: string) {
  return useQuery({
    queryKey: productQueryKeys.detail(handle),
    queryFn: () => fetchProduct(handle),
    staleTime: 5 * 60 * 1000,
  });
}

/** Up to 3 books from the same (most specific) category, excluding the current book */
export function useRelatedBooks(book: Book) {
  const category = relatedCategory(book);
  return useQuery({
    queryKey: productQueryKeys.related(book.handle),
    queryFn: async () => {
      if (!category) return [];
      return pickRelatedBooks(book, await fetchBooks({ category: category.handle }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** SIMULATED: writer profile, or null when there is none */
export function useWriter(slug: string) {
  return useQuery({
    queryKey: productQueryKeys.writer(slug),
    queryFn: () => fetchWriter(slug),
    staleTime: 10 * 60 * 1000,
  });
}
