import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchReviews, submitReview } from '../api';
import { createReview, loadReviews, reviewerName, saveReview } from '../lib/reviews';
import type { ReviewInput } from '../lib/schemas';
import type { Review } from '../types';

/** Reviews for one book via the custom reviews store routes with local storage fallback */
export function useReviews(productId?: string, handle?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['reviews', productId ?? handle];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const local = handle ? loadReviews(handle) : [];
      if (productId) {
        try {
          const res = await fetchReviews(productId);
          // Combine local reviews (newest) with backend reviews, avoiding duplicates by id
          const ids = new Set(local.map((r) => r.id));
          const merged = [...local, ...res.reviews.filter((r) => !ids.has(r.id))];
          return merged;
        } catch {
          return local;
        }
      }
      return local;
    },
    enabled: Boolean(productId ?? handle),
  });

  const mutation = useMutation({
    mutationFn: async ({
      input,
      customer,
    }: {
      input: ReviewInput;
      customer?: { firstName: string; lastName: string } | null;
    }) => {
      const name = reviewerName(customer);
      const localReview = createReview(input, name);
      if (handle) {
        saveReview(handle, localReview);
      }

      // If customer is authenticated and productId is present, also persist via backend route
      if (productId && customer) {
        try {
          await submitReview({
            productId,
            content: input.text,
            rating: input.rating,
          });
        } catch {
          // Backend error or mock fallback: localReview still returned
        }
      }

      return localReview;
    },
    onSuccess: (newReview) => {
      queryClient.setQueryData<Review[]>(queryKey, (old = []) => [newReview, ...old]);
    },
  });

  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    addReview: (input: ReviewInput, customer?: { firstName: string; lastName: string } | null) =>
      mutation.mutateAsync({ input, customer }),
    isSubmitting: mutation.isPending,
  };
}
