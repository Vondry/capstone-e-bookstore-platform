/**
 * SIMULATED: the custom Reviews routes (docs/api/openapi.yaml) — GET /store/products/:id/reviews
 * and POST /store/reviews.
 * The real backend serves them from the Reviews module (backend/src/modules/product-review).
 */

import { http, HttpResponse, type HttpHandler } from 'msw';
import type { CreateReviewResponse, ReviewDTO, ReviewsResponse } from '../../lib/storeTypes';
import { customerFromRequest, newId } from '../db';
import { mockBooks } from '../data/books';

const initialReviews: ReviewDTO[] = [
  {
    id: 'rev_1',
    product_id: mockBooks.find((b) => b.handle === 'the-art-of-focus')?.id ?? 'prod_focus',
    first_name: 'Asha',
    last_name: 'Verma',
    rating: 5,
    content: 'Clear and actionable advice on staying focused in a noisy world. Highly recommended!',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev_2',
    product_id: mockBooks.find((b) => b.handle === 'the-midnight-hour')?.id ?? 'prod_midnight',
    first_name: 'Asha',
    last_name: 'Verma',
    rating: 4,
    content: 'Thrilling and kept me guessing until the very end. A fast, enjoyable page-turner.',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

let reviews: ReviewDTO[] = [...initialReviews];

export const reviewHandlers: HttpHandler[] = [
  http.get('*/store/products/:id/reviews', ({ params, request }) => {
    const url = new URL(request.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 10) || 10, 1), 50);
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 0) || 0, 0);

    const productId = String(params.id);
    const forProduct = reviews.filter((r) => r.product_id === productId);
    const paged = forProduct.slice(offset, offset + limit);
    const averageRating =
      forProduct.length > 0
        ? Math.round((forProduct.reduce((sum, r) => sum + r.rating, 0) / forProduct.length) * 10) /
          10
        : null;

    const body: ReviewsResponse = {
      reviews: paged,
      count: forProduct.length,
      average_rating: averageRating,
    };
    return HttpResponse.json(body);
  }),

  http.post('*/store/reviews', async ({ request }) => {
    const customer = customerFromRequest(request);
    if (!customer) {
      return HttpResponse.json(
        { type: 'unauthorized', message: 'Log in to leave a review' },
        { status: 401 }
      );
    }

    const { product_id, content, rating } = (await request.json()) as {
      product_id: string;
      content: string;
      rating: number;
    };

    if (!content || content.trim().length > 100 || rating < 1 || rating > 5) {
      return HttpResponse.json(
        { type: 'invalid_data', message: 'Invalid review data' },
        { status: 400 }
      );
    }

    const newReview: ReviewDTO = {
      id: newId('rev'),
      product_id,
      first_name: customer.firstName,
      last_name: customer.lastName,
      content: content.trim(),
      rating,
      created_at: new Date().toISOString(),
    };

    reviews.unshift(newReview);

    const body: CreateReviewResponse = { review: newReview };
    return HttpResponse.json(body);
  }),
];

export function resetMockReviews(): void {
  reviews = [...initialReviews];
}
