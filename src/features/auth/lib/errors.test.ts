import { describe, expect, it } from 'vitest';
import { FetchError } from '@/lib/medusa';
import { authErrorMessage, GENERIC_AUTH_ERROR } from './errors';

const httpError = (status: number, message = 'x') => new FetchError(message, '', status);

describe('authErrorMessage', () => {
  it('explains wrong credentials on login', () => {
    expect(authErrorMessage(httpError(401), 'login')).toMatch(/Incorrect e-mail or password/);
  });

  it('explains an existing account on register', () => {
    expect(authErrorMessage(httpError(409), 'register')).toMatch(/already exists/);
    // Medusa's own wording for a taken e-mail
    expect(
      authErrorMessage(httpError(401, 'Identity with email already exists'), 'register')
    ).toMatch(/already exists/);
  });

  it('falls back to a generic message', () => {
    expect(authErrorMessage(httpError(500), 'login')).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage(httpError(401), 'register')).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage(httpError(409), 'login')).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage(new TypeError('Failed to fetch'), 'login')).toBe(GENERIC_AUTH_ERROR);
  });
});
