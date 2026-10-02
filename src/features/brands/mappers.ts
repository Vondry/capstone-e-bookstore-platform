/**
 * Brands DTOs (docs/api/openapi.yaml) → domain types
 */

import type { PublisherSummaryDTO, WriterSummaryDTO } from '@/lib/storeTypes';
import type { Publisher, WriterSummary } from './types';

export function toWriterSummary(writer: WriterSummaryDTO): WriterSummary {
  return {
    slug: writer.slug,
    name: writer.name,
    avatarUrl: writer.avatar_url,
    bookCount: writer.book_count,
  };
}

export function toPublisher(publisher: PublisherSummaryDTO): Publisher {
  return {
    slug: publisher.slug,
    name: publisher.name,
    description: publisher.description,
    bookCount: publisher.book_count,
  };
}
