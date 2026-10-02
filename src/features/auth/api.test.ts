import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/mocks/db';
import { server } from '@/mocks/server';
import { AUTH_TOKEN_KEY, sdk } from '@/lib/medusa';
import { loginAsDemo } from '@/test/render';
import { fetchCustomer, login } from './api';

describe('fetchCustomer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is null for guests without calling the API', async () => {
    await expect(fetchCustomer()).resolves.toBeNull();
  });

  it('returns the customer with the gift points balance', async () => {
    loginAsDemo();
    await expect(fetchCustomer()).resolves.toMatchObject({ email: DEMO_EMAIL, giftPoints: 120 });
  });

  it('logs out and treats an expired token as a guest', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'expired');
    await expect(fetchCustomer()).resolves.toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it('surfaces server errors', async () => {
    loginAsDemo();
    server.use(
      http.get('*/store/customers/me', () =>
        HttpResponse.json({ message: 'Down' }, { status: 500 })
      )
    );
    await expect(fetchCustomer()).rejects.toThrow('Down');
  });

  it('treats unavailable storage as a guest', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    await expect(fetchCustomer()).resolves.toBeNull();
  });
});

describe('login', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refuses logins that need another step (redirect, MFA)', async () => {
    vi.spyOn(sdk.auth, 'login').mockResolvedValue({ location: 'https://idp.example' });
    await expect(login(DEMO_EMAIL, DEMO_PASSWORD)).rejects.toThrow('Login needs another step');
  });

  it('fails when the token gives no customer', async () => {
    vi.spyOn(sdk.auth, 'login').mockResolvedValue('token-without-customer');
    await expect(login(DEMO_EMAIL, DEMO_PASSWORD)).rejects.toThrow('Login failed');
  });
});
