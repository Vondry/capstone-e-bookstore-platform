/**
 * SIMULATED: the custom Brands routes (docs/api/openapi.yaml) — writers and publishers.
 * The real backend serves them from the Brands module (backend/src/modules/brands).
 */

import { http, HttpResponse, type HttpHandler } from 'msw';
import type {
  PublisherResponse,
  PublishersResponse,
  WriterResponse,
  WritersResponse,
} from '../../lib/storeTypes';
import { mockBooks } from '../data/books';
import { findPublisher, mockPublishers } from '../data/publishers';
import { findWriter, mockWriters } from '../data/writers';

const notFound = (what: string) =>
  HttpResponse.json({ type: 'not_found', message: `${what} not found` }, { status: 404 });

const booksBy = (match: (book: (typeof mockBooks)[number]) => boolean) =>
  mockBooks.filter(match).map((book) => book.id);

export const writerHandlers: HttpHandler[] = [
  http.get('*/store/writers', () => {
    const body: WritersResponse = {
      writers: mockWriters
        .map((writer) => ({
          slug: writer.slug,
          name: writer.name,
          avatar_url: writer.avatarUrl,
          book_count: booksBy((book) => book.author.slug === writer.slug).length,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
    return HttpResponse.json(body);
  }),

  http.get('*/store/writers/:slug', ({ params }) => {
    const writer = findWriter(String(params.slug));
    if (!writer) return notFound('Writer');
    const body: WriterResponse = {
      writer: {
        slug: writer.slug,
        name: writer.name,
        bio: writer.bio,
        avatar_url: writer.avatarUrl,
        product_ids: booksBy((book) => book.author.slug === writer.slug),
      },
    };
    return HttpResponse.json(body);
  }),

  http.get('*/store/publishers', () => {
    const body: PublishersResponse = {
      publishers: mockPublishers.map(({ slug, name, description, bookCount }) => ({
        slug,
        name,
        description,
        book_count: bookCount,
      })),
    };
    return HttpResponse.json(body);
  }),

  http.get('*/store/publishers/:slug', ({ params }) => {
    const publisher = findPublisher(String(params.slug));
    if (!publisher) return notFound('Publisher');
    const body: PublisherResponse = {
      publisher: {
        slug: publisher.slug,
        name: publisher.name,
        description: publisher.description,
        book_count: publisher.bookCount,
        product_ids: booksBy((book) => book.publisher?.slug === publisher.slug),
      },
    };
    return HttpResponse.json(body);
  }),
];
