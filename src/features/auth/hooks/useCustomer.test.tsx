import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { addLineItem, getStoredCartId } from '../../cart/api';
import { cartQueryKeys, useCart } from '../../cart/hooks/useCart';
import { loginAsDemo } from '@/test/render';
import { useLogout } from './useCustomer';

describe('useLogout', () => {
  it('forgets the cart so the next visitor on the device starts empty', async () => {
    loginAsDemo();
    await addLineItem('variant_07');
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => ({ logout: useLogout(), cart: useCart() }), { wrapper });
    await waitFor(() => {
      expect(result.current.cart.data?.lines).toHaveLength(1);
    });

    act(() => {
      result.current.logout();
    });

    expect(getStoredCartId()).toBeNull();
    expect(queryClient.getQueryData(cartQueryKeys.cart)).toBeNull();
  });
});
