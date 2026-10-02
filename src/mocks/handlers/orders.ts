/**
 * SIMULATED: Medusa's store order routes, plus the custom cancel-request route
 * (docs/api/openapi.yaml). Responses use Medusa DTO shapes (src/mocks/medusa/carts.ts).
 * Docs: https://docs.medusajs.com/api/store#orders
 */

import { http, HttpResponse } from 'msw';
import { CANCEL_WINDOW_HOURS } from '../../features/orders/lib/cancelWindow';
import type { CancellationRequestResponse, OrdersResponse } from '../../lib/storeTypes';
import { customerFromRequest, db, persist } from '../db';
import { toOrderDTO } from '../medusa/carts';

const CANCEL_WINDOW_MS = CANCEL_WINDOW_HOURS * 60 * 60 * 1000;

const error = (status: number, message: string, type: string) =>
  HttpResponse.json({ type, message }, { status });
const unauthorized = () => error(401, 'Log in to see your orders', 'unauthorized');
const notFound = () => error(404, 'Order not found', 'not_found');

export const orderHandlers = [
  http.get('*/store/orders', ({ request }) => {
    const customer = customerFromRequest(request);
    if (!customer) return unauthorized();
    const orders = db.orders
      .filter((order) => order.customerId === customer.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toOrderDTO);
    const body: OrdersResponse = { orders, count: orders.length, offset: 0, limit: 50 };
    return HttpResponse.json(body);
  }),

  // SIMULATED: guests can open their own confirmation page by id (S6). The real backend must
  // restrict this (see the review notes in plan 14).
  http.get('*/store/orders/:id', ({ params }) => {
    const order = db.orders.find((o) => o.id === params.id);
    return order ? HttpResponse.json({ order: toOrderDTO(order) }) : notFound();
  }),

  http.post('*/store/orders/:id/cancel-request', ({ params, request }) => {
    const customer = customerFromRequest(request);
    if (!customer) return unauthorized();
    const order = db.orders.find((o) => o.id === params.id && o.customerId === customer.id);
    if (!order) return notFound();
    if (order.status === 'cancellation_requested') {
      return error(409, 'A cancellation was already requested', 'not_allowed');
    }
    if (Date.now() - new Date(order.createdAt).getTime() >= CANCEL_WINDOW_MS) {
      return error(409, 'Orders can only be cancelled within 48 hours', 'not_allowed');
    }
    order.status = 'cancellation_requested';
    order.cancellationRequestedAt = new Date().toISOString();
    persist();
    const body: CancellationRequestResponse = {
      cancellation_request: {
        id: `creq_${order.id}`,
        order_id: order.id,
        status: 'requested',
        created_at: order.cancellationRequestedAt,
      },
    };
    return HttpResponse.json(body);
  }),
];
