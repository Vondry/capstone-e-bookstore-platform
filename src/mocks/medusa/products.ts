/**
 * SIMULATED: builds Medusa `StoreProduct` DTOs (with Brands links) from the mock catalogue, so
 * the frontend runs the same api.ts + mappers in mock and live mode (plan 14).
 */

import type { HttpTypes } from '@medusajs/types';
import type { Book } from '../../features/catalog/types';
import type { BookProductDTO } from '../../lib/storeTypes';
import { mockBooks, newLaunchHandles } from '../data/books';

// Fixed dates keep responses deterministic: new launches are the newest products
const CATALOGUE_DATE = Date.UTC(2026, 0, 1);
const LAUNCH_DATE = Date.UTC(2026, 8, 1);
const DAY = 24 * 60 * 60 * 1000;

function createdAt(book: Book, index: number): string {
  const launchIndex = newLaunchHandles.indexOf(book.handle);
  const time =
    launchIndex === -1 ? CATALOGUE_DATE + index * DAY : LAUNCH_DATE + (3 - launchIndex) * DAY;
  return new Date(time).toISOString();
}

const timestamps = (date: string) => ({ created_at: date, updated_at: date, deleted_at: null });

function category(entry: Book['categories'][number], date: string): HttpTypes.StoreProductCategory {
  return {
    id: `pcat_${entry.handle}`,
    name: entry.name,
    handle: entry.handle,
    description: '',
    rank: null,
    external_id: null,
    parent_category_id: null,
    parent_category: null,
    category_children: [],
    ...timestamps(date),
  };
}

export function toProductDTO(book: Book, index: number): BookProductDTO {
  const date = createdAt(book, index);
  const variant: HttpTypes.StoreProductVariant = {
    id: book.variantId,
    title: book.format,
    sku: null,
    barcode: null,
    ean: null,
    upc: null,
    thumbnail: null,
    allow_backorder: false,
    manage_inventory: false,
    hs_code: null,
    origin_country: null,
    mid_code: null,
    material: null,
    weight: null,
    length: null,
    height: null,
    width: null,
    options: null,
    ...timestamps(date),
    calculated_price: {
      id: `price_${book.id}`,
      calculated_amount: book.priceInr,
      original_amount: book.priceInr,
      original_amount_with_tax: null,
      original_amount_without_tax: null,
      currency_code: 'inr',
    },
  };

  return {
    id: book.id,
    handle: book.handle,
    title: book.title,
    subtitle: book.subtitle ?? null,
    description: book.description,
    is_giftcard: false,
    status: 'published',
    thumbnail: book.coverUrl,
    width: null,
    weight: null,
    length: null,
    height: null,
    origin_country: null,
    hs_code: null,
    mid_code: null,
    material: null,
    collection_id: null,
    type_id: `ptyp_${book.format.toLowerCase()}`,
    type: { id: `ptyp_${book.format.toLowerCase()}`, value: book.format, ...timestamps(date) },
    tags: [
      {
        id: `ptag_${book.language.toLowerCase()}`,
        value: book.language,
        ...timestamps(date),
      },
    ],
    categories: book.categories.map((entry) => category(entry, date)),
    variants: [variant],
    options: null,
    images: [{ id: `img_${book.id}_front`, url: book.coverUrl, rank: 0 }],
    discountable: true,
    external_id: null,
    ...timestamps(date),
    metadata: {
      rating: book.rating ?? null,
      sold_count: book.soldCount ?? null,
      category_handles: book.categories.map((entry) => entry.handle),
    },
    writer: { slug: book.author.slug, name: book.author.name },
    publisher: book.publisher ? { slug: book.publisher.slug, name: book.publisher.name } : null,
  };
}

export const mockProducts: BookProductDTO[] = mockBooks.map(toProductDTO);

export function productById(id: string): BookProductDTO | undefined {
  return mockProducts.find((product) => product.id === id);
}

export const mockCategories: HttpTypes.StoreProductCategory[] = Array.from(
  new Map(
    mockBooks.flatMap((book, index) =>
      book.categories.map((entry) => [entry.handle, category(entry, createdAt(book, index))])
    )
  ).values()
);
