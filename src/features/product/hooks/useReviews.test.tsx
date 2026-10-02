import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { loadReviews } from '../lib/reviews';
import { useReviews } from './useReviews';

/** Renders the hook and waits for the first load, as the review form only appears after it */
async function renderReviews(productId?: string, handle?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rendered = renderHook(() => useReviews(productId, handle), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  await waitFor(() => {
    expect(rendered.result.current.isLoading).toBe(false);
  });
  return rendered;
}

const failingReviews = (status: number) =>
  http.get('*/store/products/:id/reviews', () =>
    HttpResponse.json({ message: 'Reviews down' }, { status })
  );

describe('useReviews', () => {
  it('does not query without a product', async () => {
    const { result } = await renderReviews();
    expect(result.current.reviews).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('falls back to the reviews saved in this browser when the backend fails', async () => {
    server.use(failingReviews(500));
    const { result } = await renderReviews('prod_1', 'godaan');
    await act(async () => {
      await result.current.addReview({ text: 'Moving.', rating: 5 });
    });
    await waitFor(() => {
      expect(result.current.reviews.map((review) => review.text)).toEqual(['Moving.']);
    });
  });

  it('uses only local reviews when there is no product id', async () => {
    const { result } = await renderReviews(undefined, 'godaan');
    await act(async () => {
      await result.current.addReview({ text: 'Local only.', rating: 4 }, null);
    });
    await waitFor(() => {
      expect(result.current.reviews[0]?.text).toBe('Local only.');
    });
    expect(loadReviews('godaan')).toHaveLength(1);
  });

  it('keeps the review when saving it on the backend fails', async () => {
    server.use(
      http.post('*/store/reviews', () => HttpResponse.json({ message: 'Down' }, { status: 500 }))
    );
    const { result } = await renderReviews('prod_1', 'godaan');
    let saved: Awaited<ReturnType<typeof result.current.addReview>> | undefined;
    await act(async () => {
      saved = await result.current.addReview(
        { text: 'Still here.', rating: 3 },
        { firstName: 'Asha', lastName: 'Rao' }
      );
    });
    expect(saved?.name).toBe('Asha R.');
    await waitFor(() => {
      expect(result.current.reviews[0]?.text).toBe('Still here.');
    });
  });
});
