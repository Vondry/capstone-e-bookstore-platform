/**
 * Medusa product DTO → domain `Book` (.bob/rules/01: the UI never sees backend shapes).
 * Field mapping: docs/data-model.md → Catalog.
 */

import type { BookProductDTO } from '@/lib/storeTypes';
import type { Book, BookFormat, Category } from './types';

const FORMATS: BookFormat[] = ['Paperback', 'Hardcover', 'eBook'];

/** Product fields every book request asks for (prices need a region_id too) */
export const BOOK_FIELDS =
  '*categories,*type,*tags,*images,*variants.calculated_price,+metadata,+writer.*,+publisher.*';

function metadataNumber(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === 'number' ? value : undefined;
}

function toFormat(value: string | undefined): BookFormat {
  return FORMATS.find((format) => format === value) ?? 'Paperback';
}

/** Medusa returns categories unordered; the seed keeps the intended order in metadata */
function orderedCategories(product: BookProductDTO): Category[] {
  const categories = (product.categories ?? []).map(({ id, name, handle }) => ({
    id,
    name,
    handle,
  }));
  const order = product.metadata?.category_handles;
  if (!Array.isArray(order)) return categories;
  const rank = (handle: string) => {
    const index = order.indexOf(handle);
    return index === -1 ? order.length : index;
  };
  return categories.sort((a, b) => rank(a.handle) - rank(b.handle));
}

export function toBook(product: BookProductDTO): Book {
  const variant = product.variants?.[0];
  if (!variant) throw new Error(`Product ${product.handle} has no variant`);
  const backCover = product.images?.find((image) => image.rank === 1);
  const rating = metadataNumber(product.metadata, 'rating');
  const soldCount = metadataNumber(product.metadata, 'sold_count');

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    ...(product.subtitle ? { subtitle: product.subtitle } : {}),
    author: product.writer
      ? { name: product.writer.name, slug: product.writer.slug }
      : { name: 'Unknown writer', slug: '' },
    ...(product.publisher
      ? { publisher: { name: product.publisher.name, slug: product.publisher.slug } }
      : {}),
    description: product.description ?? '',
    format: toFormat(product.type?.value),
    categories: orderedCategories(product),
    language: product.tags?.[0]?.value ?? 'English',
    priceInr: variant.calculated_price?.calculated_amount ?? 0,
    coverUrl: product.thumbnail ?? '',
    ...(backCover ? { backCoverUrl: backCover.url } : {}),
    ...(rating === undefined ? {} : { rating }),
    ...(soldCount === undefined ? {} : { soldCount }),
    variantId: variant.id,
  };
}

/** Keeps the order of `ids` (e.g. bestseller rank); unknown ids are dropped */
export function orderByIds(books: Book[], ids: string[]): Book[] {
  return ids.flatMap((id) => books.filter((book) => book.id === id));
}
