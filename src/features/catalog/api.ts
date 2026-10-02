/**
 * Catalogue API — Medusa store products (plan 14). Mock mode: answered by MSW (src/mocks).
 * Docs: https://docs.medusajs.com/resources/references/js-sdk/store/product
 */

import { REGION_ID, sdk } from '@/lib/medusa';
import type { BestsellersResponse, BookProductDTO } from '@/lib/storeTypes';
import { refineBooks } from './lib/refineBooks';
import { BOOK_FIELDS, orderByIds, toBook } from './mappers';
import type { Book, Filters } from './types';

type BookQuery = {
  q?: string;
  handle?: string;
  id?: string[];
  category_id?: string;
  order?: string;
  limit?: number;
};

/** One page covers the whole seed catalogue */
const PAGE_SIZE = 100;

async function listBooks(query: BookQuery = {}): Promise<Book[]> {
  const { products } = await sdk.store.product.list({
    limit: PAGE_SIZE,
    ...query,
    region_id: REGION_ID,
    fields: BOOK_FIELDS,
  });
  return (products as BookProductDTO[]).map(toBook);
}

// Category handles come from URLs; the API filters by id. Ids don't change while the app runs.
const categoryIds = new Map<string, string | null>();

async function categoryIdFor(handle: string): Promise<string | null> {
  if (!categoryIds.has(handle)) {
    const { product_categories: categories } = await sdk.store.category.list({
      handle,
      fields: 'id,handle',
    });
    categoryIds.set(handle, categories[0]?.id ?? null);
  }
  return categoryIds.get(handle) ?? null;
}

/** Books matching the filters: search, category and "newest" via the API, the rest in the browser */
export async function fetchBooks(filters: Partial<Filters> = {}): Promise<Book[]> {
  const query: BookQuery = {};
  if (filters.search) query.q = filters.search;
  if (filters.category && filters.category !== 'all') {
    const categoryId = await categoryIdFor(filters.category);
    if (!categoryId) return [];
    query.category_id = categoryId;
  }
  if (filters.sortBy === 'newest') query.order = '-created_at';
  return refineBooks(await listBooks(query), filters);
}

/** The book with this handle, or null when there is none */
export async function fetchBook(handle: string): Promise<Book | null> {
  const [book] = await listBooks({ handle });
  return book ?? null;
}

/** Books by id, in the order of `ids` */
export async function fetchBooksByIds(ids: string[]): Promise<Book[]> {
  if (ids.length === 0) return [];
  return orderByIds(await listBooks({ id: ids }), ids);
}

/** "Bestsellers this Month" (custom route, docs/api/openapi.yaml) */
export async function fetchBestsellers(): Promise<Book[]> {
  const { product_ids: ids } = await sdk.client.fetch<BestsellersResponse>(
    '/store/catalog/bestsellers',
    { query: { limit: 3 } }
  );
  return fetchBooksByIds(ids);
}

/** "New Launches": the newest products */
export async function fetchNewLaunches(): Promise<Book[]> {
  return listBooks({ order: '-created_at', limit: 3 });
}
