/**
 * Maps auth API failures to the copy shown in the form's inline alert (S1)
 */

import { isHttpError } from '@/lib/medusa';

export type AuthMode = 'login' | 'register';

export const GENERIC_AUTH_ERROR = 'Something went wrong. Please try again.';

export function authErrorMessage(error: unknown, mode: AuthMode): string {
  if (!isHttpError(error)) return GENERIC_AUTH_ERROR;
  if (mode === 'login' && error.status === 401) {
    return 'Incorrect e-mail or password. Please try again.';
  }
  // Medusa answers a taken e-mail with "Identity with email already exists"
  if (mode === 'register' && (error.status === 409 || /already exists/i.test(error.message))) {
    return 'An account with this e-mail already exists. Log in instead.';
  }
  return GENERIC_AUTH_ERROR;
}
