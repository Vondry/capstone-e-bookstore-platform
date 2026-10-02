/**
 * Product detail API (S3): the book and its writer's profile.
 * Docs: https://docs.medusajs.com/api/store#products · writers: docs/api/openapi.yaml
 */

import { nullOnNotFound, sdk } from '@/lib/medusa';
import type { CreateReviewResponse, ReviewsResponse, WriterResponse } from '@/lib/storeTypes';
import { fetchBook } from '../catalog/api';
import type { Book } from '../catalog/types';
import type { Review, Writer } from './types';

/** The book with this handle, or null when it does not exist */
export function fetchProduct(handle: string): Promise<Book | null> {
  return fetchBook(handle);
}

/** The writer profile (Brands module), or null when there is none */
export async function fetchWriter(slug: string): Promise<Writer | null> {
  const data = await nullOnNotFound(
    sdk.client.fetch<WriterResponse>(`/store/writers/${encodeURIComponent(slug)}`)
  );
  if (!data) return null;
  const { name, bio, avatar_url: avatarUrl } = data.writer;
  return { slug: data.writer.slug, name, bio, avatarUrl };
}

/** Reviews for a product (Reviews module, docs/api/openapi.yaml) */
export async function fetchReviews(productId: string): Promise<{
  reviews: Review[];
  count: number;
  averageRating: number | null;
}> {
  const data = await sdk.client.fetch<ReviewsResponse>(
    `/store/products/${encodeURIComponent(productId)}/reviews`
  );
  return {
    reviews: data.reviews.map((r) => ({
      id: r.id,
      name: `${r.first_name} ${r.last_name}`.trim() || 'Reader',
      text: r.content,
      rating: r.rating,
      createdAt: r.created_at,
    })),
    count: data.count,
    averageRating: data.average_rating,
  };
}

/** Submit a review for a product (requires login, auto-approved; D6) */
export async function submitReview(input: {
  productId: string;
  content: string;
  rating: number;
}): Promise<Review> {
  const data = await sdk.client.fetch<CreateReviewResponse>('/store/reviews', {
    method: 'POST',
    body: {
      product_id: input.productId,
      content: input.content,
      rating: input.rating,
    },
  });
  return {
    id: data.review.id,
    name: `${data.review.first_name} ${data.review.last_name}`.trim() || 'Reader',
    text: data.review.content,
    rating: data.review.rating,
    createdAt: data.review.created_at,
  };
}
