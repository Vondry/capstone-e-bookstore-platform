/**
 * TanStack Query hooks for orders
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchOrder, fetchOrders, requestOrderCancellation } from '../api';

export const ordersQueryKeys = {
  all: ['orders'] as const,
  list: () => [...ordersQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...ordersQueryKeys.all, 'detail', id] as const,
};

export function useOrders(enabled = true) {
  return useQuery({
    queryKey: ordersQueryKeys.list(),
    queryFn: fetchOrders,
    enabled,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ordersQueryKeys.detail(id),
    queryFn: () => fetchOrder(id),
  });
}

export function useRequestCancellation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestOrderCancellation(id),
    onSuccess: (order) => {
      queryClient.setQueryData(ordersQueryKeys.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.list() });
    },
  });
}
