/**
 * Shared S1 page logic: the safe post-auth target from `?redirect=`, the document title,
 * and whether the visitor is already logged in (pages then redirect straight to the target).
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';
import { safeRedirect } from '../lib/redirect';

export function useAuthRedirect(title: string) {
  const [searchParams] = useSearchParams();
  const target = safeRedirect(searchParams.get('redirect'));
  const { data: customer } = useCustomer();

  useEffect(() => {
    document.title = `${title} · Book Worm`;
  }, [title]);

  return { target, isLoggedIn: Boolean(customer) };
}
