/**
 * Mock publishers for brand browsing (deck journey 6), from the shared seed.
 * SIMULATED: served by the mock of the custom Brands routes (docs/api/openapi.yaml).
 */

import { seedPublishers } from '@shared/catalog';
import type { Publisher } from '../../features/brands/types';
import { mockBooks } from './books';

export const mockPublishers: Publisher[] = seedPublishers
  .map(({ slug, name, description }) => ({
    slug,
    name,
    description,
    bookCount: mockBooks.filter((book) => book.publisher?.slug === slug).length,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function findPublisher(slug: string): Publisher | undefined {
  return mockPublishers.find((publisher) => publisher.slug === slug);
}
