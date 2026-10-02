/**
 * TanStack Query hooks for the customer session
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { setStoredCartId, transferStoredCart } from '../../cart/api';
import { fetchCustomer, login, logout, register } from '../api';
import type { RegisterInput } from '../types';

export const authQueryKeys = {
  customer: ['customer'] as const,
};

/** `data` is the customer, or null for guests */
export function useCustomer() {
  return useQuery({
    queryKey: authQueryKeys.customer,
    queryFn: fetchCustomer,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const customer = await login(email, password);
      await transferStoredCart();
      return customer;
    },
    onSuccess: (customer) => {
      queryClient.setQueryData(authQueryKeys.customer, customer);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const customer = await register(input);
      await transferStoredCart();
      return customer;
    },
    onSuccess: (customer) => {
      queryClient.setQueryData(authQueryKeys.customer, customer);
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    void logout();
    queryClient.setQueryData(authQueryKeys.customer, null);
    queryClient.removeQueries({ queryKey: ['orders'] });
    // Forget the cart too: on a shared device the next visitor must not see it or its address
    setStoredCartId(null);
    queryClient.setQueryData(['cart'], null);
  };
}
