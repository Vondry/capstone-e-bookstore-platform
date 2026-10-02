/**
 * SIMULATED: Medusa v2 emailpass auth and the store customer routes, plus the custom
 * loyalty-points balance route (docs/api/openapi.yaml).
 * Docs: https://docs.medusajs.com/resources/storefront-development/customers/register
 */

import { http, HttpResponse } from 'msw';
import type { HttpTypes } from '@medusajs/types';
import { fromMedusaAddress } from '../../features/checkout/mappers';
import type { LoyaltyPointsResponse } from '../../lib/storeTypes';
import { customerFromRequest, db, newId, persist } from '../db';
import { toCustomerDTO } from '../medusa/customers';

const tokenFor = (customerId: string) => `mock-token-${customerId}`;
const IDENTITY_PREFIX = 'mock-identity-';

// Registered identities waiting for their customer record (Medusa's register → create customer)
const pendingIdentities = new Map<string, { email: string; password: string }>();

const unauthorized = (message = 'Unauthorized') =>
  HttpResponse.json({ type: 'unauthorized', message }, { status: 401 });

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const authHandlers = [
  http.post('*/auth/customer/emailpass', async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string };
    const customer = db.customers.find((c) => sameEmail(c.email, email));
    if (customer?.password !== password) return unauthorized('Invalid email or password');
    return HttpResponse.json({ token: tokenFor(customer.id) });
  }),

  http.post('*/auth/customer/emailpass/register', async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string };
    if (db.customers.some((c) => sameEmail(c.email, email))) {
      return unauthorized('Identity with email already exists');
    }
    const id = newId('cus');
    pendingIdentities.set(id, { email: email.trim(), password });
    // The token has no customer yet; it's only good for creating one
    return HttpResponse.json({ token: `${IDENTITY_PREFIX}${id}` });
  }),

  http.post('*/store/customers', async ({ request }) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
    const id = token.startsWith(IDENTITY_PREFIX) ? token.slice(IDENTITY_PREFIX.length) : '';
    const identity = pendingIdentities.get(id);
    if (!identity) return unauthorized();
    const body = (await request.json()) as HttpTypes.StoreCreateCustomer;
    const customer = {
      id,
      email: identity.email,
      password: identity.password,
      firstName: body.first_name ?? '',
      lastName: body.last_name ?? '',
      savedAddress: null,
      giftPoints: 0,
    };
    db.customers.push(customer);
    pendingIdentities.delete(id);
    persist();
    return HttpResponse.json({ customer: toCustomerDTO(customer) });
  }),

  http.get('*/store/customers/me', ({ request }) => {
    const customer = customerFromRequest(request);
    if (!customer) return unauthorized();
    return HttpResponse.json({ customer: toCustomerDTO(customer) });
  }),

  http.post('*/store/customers/me/addresses', async ({ request }) => {
    const customer = customerFromRequest(request);
    if (!customer) return unauthorized();
    const body = (await request.json()) as HttpTypes.StoreCreateCustomerAddress;
    customer.savedAddress = fromMedusaAddress(body, customer.email);
    persist();
    return HttpResponse.json({ customer: toCustomerDTO(customer) });
  }),

  // Custom route (Loyalty module)
  http.get('*/store/customers/me/loyalty-points', ({ request }) => {
    const customer = customerFromRequest(request);
    if (!customer) return unauthorized();
    const body: LoyaltyPointsResponse = { points: customer.giftPoints };
    return HttpResponse.json(body);
  }),
];
