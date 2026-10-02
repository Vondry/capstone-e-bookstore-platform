/**
 * Mock catalogue as domain `Book`s, built from the shared seed (shared/catalog).
 * SIMULATED: the MSW mock backend serves these as Medusa products (src/mocks/medusa.ts).
 * The first nine books mirror the wireframe `01-home-catalogue.png`.
 */

import { makeCover, seedBooks, seedCategories, seedPublishers, seedWriters } from '@shared/catalog';
import type { Book, Category } from '../../features/catalog/types';

function lookup<T extends { slug?: string; handle?: string }>(items: T[], key: string): T {
  const found = items.find((item) => (item.slug ?? item.handle) === key);
  if (!found) throw new Error(`Seed data refers to unknown "${key}"`);
  return found;
}

const category = (handle: string): Category => {
  const { name } = lookup(seedCategories, handle);
  return { id: handle, name, handle };
};

export const mockBooks: Book[] = seedBooks.map((seed, index) => {
  const writer = lookup(seedWriters, seed.author);
  const publisher = seed.publisher ? lookup(seedPublishers, seed.publisher) : undefined;
  const number = String(index + 1).padStart(2, '0');
  return {
    id: `book_${number}`,
    variantId: `variant_${number}`,
    handle: seed.handle,
    title: seed.title,
    ...(seed.subtitle ? { subtitle: seed.subtitle } : {}),
    author: { name: writer.name, slug: writer.slug },
    ...(publisher ? { publisher: { name: publisher.name, slug: publisher.slug } } : {}),
    description: seed.description,
    format: seed.format,
    categories: seed.categories.map(category),
    language: seed.language,
    priceInr: seed.priceInr,
    coverUrl: makeCover(seed.title, writer.name, seed.cover[0], seed.cover[1]),
    ...(seed.rating === null ? {} : { rating: seed.rating }),
    ...(seed.soldCount === null ? {} : { soldCount: seed.soldCount }),
  };
});

// SIMULATED: section membership. The Medusa seed gives these books the newest created date.
export const newLaunchHandles = seedBooks.filter((seed) => seed.isNewLaunch).map((s) => s.handle);

export function booksByHandles(handles: string[]): Book[] {
  return handles.flatMap((handle) => mockBooks.filter((book) => book.handle === handle));
}
