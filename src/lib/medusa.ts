/**
 * The single Medusa JS SDK client (.bob/rules/01). Feature `api.ts` files are the only callers.
 * In mock mode the same requests are answered by MSW (src/mocks), in Medusa's response shapes.
 * Docs: https://docs.medusajs.com/resources/js-sdk
 */

import Medusa, { FetchError } from '@medusajs/js-sdk';

export const MEDUSA_URL = import.meta.env.VITE_MEDUSA_URL ?? 'http://localhost:9100';

/** India / INR region: prices and taxes are calculated for it */
export const REGION_ID = import.meta.env.VITE_MEDUSA_REGION_ID ?? 'reg_india';

/** Where the customer's JWT is kept (the SDK reads it on every request) */
export const AUTH_TOKEN_KEY = 'bw.token';

export const sdk = new Medusa({
  baseUrl: MEDUSA_URL,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY ?? 'pk_mock',
  auth: { type: 'jwt', jwtTokenStorageMethod: 'local', jwtTokenStorageKey: AUTH_TOKEN_KEY },
});

export { FetchError };

/** True for an HTTP error response from the API, optionally with this status */
export function isHttpError(error: unknown, status?: number): error is FetchError {
  return error instanceof FetchError && (status === undefined || error.status === status);
}

/** Resolves to null instead of throwing when the API answers 404 */
export async function nullOnNotFound<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (isHttpError(error, 404)) return null;
    throw error;
  }
}
