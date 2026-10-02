/**
 * Address form state for S4: React Hook Form + Zod, "Use Saved Address" and Pay Now
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toastContext';
import type { Customer } from '../../auth/types';
import type { Cart } from '../../cart/types';
import { useUpdateCart } from '../../cart/hooks/useCart';
import { addressSchema, emptyAddress } from '../lib/schemas';
import type { Address } from '../types';

export type UseCheckoutFormOptions = {
  cart: Cart;
  customer: Customer | null;
};

export function useCheckoutForm({ cart, customer }: UseCheckoutFormOptions) {
  // Values the form started with; restored when "Use Saved Address" is unchecked
  const [initialValues] = useState<Address>(() => cart.shippingAddress ?? emptyAddress);
  const [savedAddressSelected, setSavedAddressSelected] = useState(false);
  const savedAddress = customer?.savedAddress ?? null;
  const updateCart = useUpdateCart();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const form = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialValues,
    // Validate on blur, then re-validate on every change
    mode: 'onTouched',
  });

  const toggleSavedAddress = (checked: boolean) => {
    setSavedAddressSelected(checked);
    form.reset(checked && savedAddress ? savedAddress : initialValues);
  };

  const onSubmit = form.handleSubmit(async (address) => {
    try {
      await updateCart.mutateAsync({ shippingAddress: address });
      void navigate('/payment');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save your address', 'error');
    }
  });

  return {
    form,
    canUseSavedAddress: savedAddress !== null,
    savedAddressSelected,
    toggleSavedAddress,
    onSubmit,
    isSaving: form.formState.isSubmitting || updateCart.isPending,
  };
}
