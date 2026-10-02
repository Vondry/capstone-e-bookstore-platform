/**
 * Recommendations for the current visitor (home page and cart)
 */

import { useMemo } from 'react';
import { useCustomer } from '../../auth/hooks/useCustomer';
import { useBooks } from '../../catalog/hooks/useBooks';
import { useOrders } from '../../orders/hooks/useOrders';
import { recommendBooks, type RecommendationOptions, type Recommendations } from '../lib/recommend';

export type UseRecommendationsResult = Recommendations & {
  isLoading: boolean;
  /** Logged in with at least one order */
  hasOrderHistory: boolean;
};

export function useRecommendations(options: RecommendationOptions = {}): UseRecommendationsResult {
  const { data: customer, isLoading: isLoadingCustomer } = useCustomer();
  const isLoggedIn = Boolean(customer);
  const { data: orders, isLoading: isLoadingOrders } = useOrders(isLoggedIn);
  const { data: catalogue, isLoading: isLoadingBooks } = useBooks();

  const { exclude, limit } = options;
  const result = useMemo(
    () => recommendBooks(catalogue ?? [], isLoggedIn ? (orders ?? []) : [], { exclude, limit }),
    [catalogue, orders, isLoggedIn, exclude, limit]
  );

  return {
    ...result,
    isLoading: isLoadingCustomer || isLoadingBooks || (isLoggedIn && isLoadingOrders),
    hasOrderHistory: isLoggedIn && (orders?.length ?? 0) > 0,
  };
}
