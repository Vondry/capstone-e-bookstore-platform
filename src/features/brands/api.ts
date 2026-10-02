/**
 * Brands API — writers and publishers (deck journey 6), custom routes of the Brands module.
 * Contract: docs/api/openapi.yaml. Mock mode: src/mocks/handlers/writers.ts.
 */

import { nullOnNotFound, sdk } from '@/lib/medusa';
import type {
  PublisherResponse,
  PublishersResponse,
  WriterResponse,
  WritersResponse,
} from '@/lib/storeTypes';
import { fetchBooksByIds } from '../catalog/api';
import type { Book } from '../catalog/types';
import { toPublisher, toWriterSummary } from './mappers';
import type { Publisher, WriterSummary } from './types';

const writerPath = (slug: string) => `/store/writers/${encodeURIComponent(slug)}`;
const publisherPath = (slug: string) => `/store/publishers/${encodeURIComponent(slug)}`;

export async function fetchWriters(): Promise<WriterSummary[]> {
  const { writers } = await sdk.client.fetch<WritersResponse>('/store/writers');
  return writers.map(toWriterSummary);
}

export async function fetchPublishers(): Promise<Publisher[]> {
  const { publishers } = await sdk.client.fetch<PublishersResponse>('/store/publishers');
  return publishers.map(toPublisher);
}

/** The publisher, or null when it does not exist */
export async function fetchPublisher(slug: string): Promise<Publisher | null> {
  const data = await nullOnNotFound(sdk.client.fetch<PublisherResponse>(publisherPath(slug)));
  return data ? toPublisher(data.publisher) : null;
}

export type BrandFilter = { author: string } | { publisher: string };

/** The books of one writer or publisher (empty when the brand does not exist) */
export async function fetchBooksByBrand(filter: BrandFilter): Promise<Book[]> {
  const ids =
    'author' in filter
      ? (await nullOnNotFound(sdk.client.fetch<WriterResponse>(writerPath(filter.author))))?.writer
          .product_ids
      : (await nullOnNotFound(sdk.client.fetch<PublisherResponse>(publisherPath(filter.publisher))))
          ?.publisher.product_ids;
  return fetchBooksByIds(ids ?? []);
}
