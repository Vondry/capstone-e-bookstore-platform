/**
 * Auth API — Medusa v2 emailpass auth for customers (mock mode: src/mocks/handlers/auth.ts)
 * Docs: https://docs.medusajs.com/resources/storefront-development/customers/register
 *       https://docs.medusajs.com/resources/storefront-development/customers/login
 *       https://docs.medusajs.com/resources/js-sdk/auth/overview
 */

import { AUTH_TOKEN_KEY, FetchError, isHttpError, sdk } from '@/lib/medusa';
import type { LoyaltyPointsResponse } from '@/lib/storeTypes';
import { toMedusaAddress } from '../checkout/mappers';
import type { Address } from '../checkout/types';
import { toCustomer } from './mappers';
import type { Customer, RegisterInput } from './types';

function hasToken(): boolean {
  try {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  } catch {
    return false;
  }
}

/** The logged-in customer with their gift points, or null for guests */
export async function fetchCustomer(): Promise<Customer | null> {
  if (!hasToken()) return null;
  try {
    const [{ customer }, { points }] = await Promise.all([
      sdk.store.customer.retrieve({ fields: '*addresses' }),
      sdk.client.fetch<LoyaltyPointsResponse>('/store/customers/me/loyalty-points'),
    ]);
    return toCustomer(customer, points);
  } catch (error) {
    if (isHttpError(error, 401)) {
      await sdk.auth.logout();
      return null;
    }
    throw error;
  }
}

async function loginWithPassword(email: string, password: string): Promise<void> {
  const result = await sdk.auth.login('customer', 'emailpass', { email, password });
  // Only plain e-mail + password is enabled; redirects, MFA and e-mail verification are not
  if (typeof result !== 'string') throw new FetchError('Login needs another step', '', 400);
}

/** Throws FetchError(401) for wrong credentials */
export async function login(email: string, password: string): Promise<Customer> {
  await loginWithPassword(email, password);
  const customer = await fetchCustomer();
  if (!customer) throw new FetchError('Login failed', 'Unauthorized', 401);
  return customer;
}

/**
 * Medusa's register flow: register the identity, create the customer with that token,
 * then log in for a token that belongs to the new customer.
 */
export async function register({
  email,
  password,
  firstName,
  lastName,
}: RegisterInput): Promise<Customer> {
  await sdk.auth.register('customer', 'emailpass', { email, password });
  await sdk.store.customer.create({ email, first_name: firstName, last_name: lastName });
  return login(email, password);
}

export async function logout(): Promise<void> {
  await sdk.auth.logout();
}

/** Saves the address to the customer's address book (used after their first order) */
export async function saveAddress(address: Address): Promise<void> {
  await sdk.store.customer.createAddress({
    ...toMedusaAddress(address),
    is_default_shipping: true,
  });
}
