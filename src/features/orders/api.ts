/**
 * Orders API — Medusa store orders, plus the custom cancel-request route (docs/api/openapi.yaml).
 * Mock mode: src/mocks/handlers/orders.ts. Docs: https://docs.medusajs.com/api/store#orders
 */

import { sdk } from '@/lib/medusa';
import type { CancellationRequestResponse } from '@/lib/storeTypes';
import { productIds } from '../cart/mappers';
import { fetchBooksByIds } from '../catalog/api';
import { asOrderDTO, ORDER_FIELDS, toOrder, type SdkOrder } from './mappers';
import type { Order } from './types';

const query = { fields: ORDER_FIELDS };

/** The logged-in customer's orders, newest first. Throws FetchError(401) for guests. */
export async function fetchOrders(): Promise<Order[]> {
  const { orders } = await sdk.store.order.list({ ...query, order: '-created_at' });
  const dtos = (orders as SdkOrder[]).map(asOrderDTO);
  const books = await fetchBooksByIds(productIds(dtos.flatMap((order) => order.items)));
  return dtos.map((order) => toOrder(order, books));
}

export async function fetchOrder(id: string): Promise<Order> {
  const { order } = await sdk.store.order.retrieve(id, query);
  const dto = asOrderDTO(order);
  return toOrder(dto, await fetchBooksByIds(productIds(dto.items)));
}

/**
 * SIMULATED: Medusa has no store-side cancel, so this records a cancellation request
 * (Cancellation module) that the store confirms in Medusa Admin. The UI must say
 * "Cancellation requested", never "Cancelled". Returns the updated order.
 */
export async function requestOrderCancellation(id: string): Promise<Order> {
  await sdk.client.fetch<CancellationRequestResponse>(`/store/orders/${id}/cancel-request`, {
    method: 'POST',
  });
  return fetchOrder(id);
}
