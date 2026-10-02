/**
 * SIMULATED: Medusa's store cart, shipping, payment-collection and complete routes, plus the
 * custom gift-points route (docs/api/openapi.yaml). Responses use Medusa DTO shapes.
 * Docs: https://docs.medusajs.com/api/store#carts
 */

import { http, HttpResponse } from 'msw';
import type { HttpTypes } from '@medusajs/types';
import { fromMedusaAddress } from '../../features/checkout/mappers';
import { COUPONS, pointsEarned, validateCoupon } from '../../features/checkout/lib/totals';
import type { PaymentMethod } from '../../features/checkout/types';
import type { CompleteCartResponse, ShippingOptionDTO } from '../../lib/storeTypes';
import { mockBooks } from '../data/books';
import { customerFromRequest, db, newId, persist, type CartRecord, type OrderRecord } from '../db';
import { cartBooks, cartTotals, SHIPPING_OPTION, toCartDTO, toOrderDTO } from '../medusa/carts';
import { queryValues } from '../query';

const PAYMENT_METHODS: PaymentMethod[] = ['credit-card', 'debit-card', 'upi', 'wallet'];

function availablePoints(request: Request): number {
  return customerFromRequest(request)?.giftPoints ?? 0;
}

function cartResponse(record: CartRecord, request: Request) {
  persist();
  return HttpResponse.json({ cart: toCartDTO(record, availablePoints(request)) });
}

function findCart(id: unknown): CartRecord | null {
  const record = db.carts[String(id)];
  return record && !record.completed ? record : null;
}

const error = (status: number, message: string, type = 'invalid_data') =>
  HttpResponse.json({ type, message }, { status });
const notFound = () => error(404, 'Cart not found', 'not_found');

function needsShipping(record: CartRecord): boolean {
  return cartBooks(record).some(({ book }) => book.format !== 'eBook');
}

function newCart(customerId: string | null): CartRecord {
  return {
    id: newId('cart'),
    customerId,
    lines: [],
    couponCode: null,
    redeemPoints: false,
    email: null,
    shippingAddress: null,
    hasShippingMethod: false,
    paymentCollectionId: null,
    hasPaymentSession: false,
    paymentMethod: null,
    completed: false,
  };
}

export const cartHandlers = [
  http.post('*/store/carts', ({ request }) => {
    // Like Medusa: a cart created while logged in belongs to that customer
    const record = newCart(customerFromRequest(request)?.id ?? null);
    db.carts[record.id] = record;
    return cartResponse(record, request);
  }),

  // Medusa's transfer: a guest's cart goes to the logged-in customer, another customer's can't
  http.post('*/store/carts/:id/customer', ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    const customer = customerFromRequest(request);
    if (!customer) return error(401, 'Unauthorized', 'unauthorized');
    if (record.customerId && record.customerId !== customer.id) {
      return error(400, 'Cannot transfer cart to a different customer', 'not_allowed');
    }
    record.customerId = customer.id;
    return cartResponse(record, request);
  }),

  http.get('*/store/carts/:id', ({ params, request }) => {
    const record = findCart(params.id);
    return record ? cartResponse(record, request) : notFound();
  }),

  http.post('*/store/carts/:id', async ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    const body = (await request.json()) as HttpTypes.StoreUpdateCart;
    if (body.email !== undefined) record.email = body.email;
    if (body.shipping_address && typeof body.shipping_address === 'object') {
      record.shippingAddress = fromMedusaAddress(body.shipping_address, record.email ?? '');
    }
    const method = body.metadata?.payment_method;
    if (typeof method === 'string' && PAYMENT_METHODS.includes(method as PaymentMethod)) {
      record.paymentMethod = method as PaymentMethod;
    }
    return cartResponse(record, request);
  }),

  http.post('*/store/carts/:id/line-items', async ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    const { variant_id: variantId, quantity } =
      (await request.json()) as HttpTypes.StoreAddCartLineItem;
    const book = mockBooks.find((b) => b.variantId === variantId);
    if (!book) return error(400, 'Unknown variant');
    const existing = record.lines.find((line) => line.bookId === book.id);
    if (existing) existing.quantity += quantity;
    else record.lines.push({ id: newId('cali'), bookId: book.id, quantity });
    return cartResponse(record, request);
  }),

  http.post('*/store/carts/:id/line-items/:lineId', async ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    const { quantity } = (await request.json()) as HttpTypes.StoreUpdateCartLineItem;
    record.lines = record.lines
      .map((line) => (line.id === params.lineId ? { ...line, quantity } : line))
      .filter((line) => line.quantity > 0);
    return cartResponse(record, request);
  }),

  http.delete('*/store/carts/:id/line-items/:lineId', ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    record.lines = record.lines.filter((line) => line.id !== params.lineId);
    persist();
    return HttpResponse.json({
      id: String(params.lineId),
      object: 'line-item',
      deleted: true,
      parent: toCartDTO(record, availablePoints(request)),
    });
  }),

  http.post('*/store/carts/:id/promotions', async ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    const { promo_codes: codes = [] } = (await request.json()) as { promo_codes?: string[] };
    const code = codes[0] ?? '';
    // Like Medusa: codes are case-sensitive, unknown codes are rejected,
    // codes whose rules don't match are silently skipped
    if (!COUPONS.some((coupon) => coupon.code === code)) {
      return error(400, `The promotion code ${code} is invalid`);
    }
    if (validateCoupon(code, cartTotals(record, 0).subtotal).ok) record.couponCode = code;
    return cartResponse(record, request);
  }),

  http.delete('*/store/carts/:id/promotions', async ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    const { promo_codes: codes = [] } = (await request.json()) as { promo_codes?: string[] };
    if (record.couponCode && codes.includes(record.couponCode)) record.couponCode = null;
    return cartResponse(record, request);
  }),

  // Custom route: redeem gift points (customer only; Loyalty module)
  http.post('*/store/carts/:id/loyalty-points', ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    const customer = customerFromRequest(request);
    if (!customer) return error(401, 'Unauthorized', 'unauthorized');
    // Like the backend's loyalty workflow: only the customer's own cart can use their points
    if (record.customerId !== customer.id) {
      return error(400, 'Log in to redeem gift points', 'not_allowed');
    }
    if (record.redeemPoints) return error(400, 'Gift points are already applied');
    if (customer.giftPoints <= 0) return error(400, 'You have no gift points to redeem');
    record.redeemPoints = true;
    return cartResponse(record, request);
  }),

  http.delete('*/store/carts/:id/loyalty-points', ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    const customer = customerFromRequest(request);
    if (!customer) return error(401, 'Unauthorized', 'unauthorized');
    if (record.customerId !== customer.id) {
      return error(400, 'Log in to redeem gift points', 'not_allowed');
    }
    record.redeemPoints = false;
    return cartResponse(record, request);
  }),

  http.get('*/store/shipping-options', ({ request }) => {
    const [cartId] = queryValues(new URL(request.url), 'cart_id');
    const record = findCart(cartId);
    if (!record) return notFound();
    const option: ShippingOptionDTO = {
      ...SHIPPING_OPTION,
      amount: cartTotals({ ...record, hasShippingMethod: true }, 0).delivery,
    };
    return HttpResponse.json({ shipping_options: [option] });
  }),

  http.post('*/store/carts/:id/shipping-methods', async ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    const { option_id: optionId } = (await request.json()) as { option_id: string };
    if (optionId !== SHIPPING_OPTION.id) return error(400, 'Unknown shipping option');
    record.hasShippingMethod = true;
    return cartResponse(record, request);
  }),

  // Custom route (backend/apps/backend/src/api/store/carts/[id]/shipping-methods/route.ts)
  http.delete('*/store/carts/:id/shipping-methods', ({ params, request }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    if (needsShipping(record)) {
      return error(400, 'This cart has books that need delivery', 'not_allowed');
    }
    record.hasShippingMethod = false;
    return cartResponse(record, request);
  }),

  http.post('*/store/payment-collections', async ({ request }) => {
    const { cart_id: cartId } = (await request.json()) as { cart_id: string };
    const record = findCart(cartId);
    if (!record) return notFound();
    record.paymentCollectionId ??= newId('paycol');
    persist();
    return HttpResponse.json({ payment_collection: { id: record.paymentCollectionId } });
  }),

  http.post('*/store/payment-collections/:id/payment-sessions', async ({ params, request }) => {
    const record = Object.values(db.carts).find(
      (cart) => cart.paymentCollectionId === String(params.id) && !cart.completed
    );
    if (!record) return error(404, 'Payment collection not found', 'not_found');
    const { provider_id: providerId } = (await request.json()) as { provider_id: string };
    if (providerId !== 'pp_system_default') return error(400, 'Unknown payment provider');
    record.hasPaymentSession = true;
    persist();
    return HttpResponse.json({
      payment_collection: {
        id: record.paymentCollectionId,
        payment_sessions: [{ id: newId('payses'), provider_id: providerId, status: 'pending' }],
      },
    });
  }),

  http.post('*/store/carts/:id/complete', ({ params }) => {
    const record = findCart(params.id);
    if (!record) return notFound();
    // Like Medusa: the order belongs to the cart's customer, not to whoever completes it
    const customer = db.customers.find((c) => c.id === record.customerId) ?? null;
    const lines = cartBooks(record);

    if (lines.length === 0) return error(400, 'Your cart is empty');
    if (!record.shippingAddress || !record.email) return error(400, 'Add a delivery address first');
    if (needsShipping(record) && !record.hasShippingMethod) {
      return error(400, 'Choose a delivery method first');
    }
    if (!record.hasPaymentSession) return error(400, 'The payment was not started');

    const totals = cartTotals(record, customer?.giftPoints ?? 0);
    const order: OrderRecord = {
      id: newId('order'),
      displayId: db.nextOrderNumber++,
      createdAt: new Date().toISOString(),
      status: 'placed',
      email: record.email,
      lines: lines.map(({ book, quantity }) => ({
        id: newId('ordli'),
        book,
        quantity,
        unitPriceInr: book.priceInr,
      })),
      totals,
      pointsEarned: pointsEarned(totals.total),
      shippingAddress: record.shippingAddress,
      paymentMethod: record.paymentMethod ?? 'credit-card',
      customerId: customer?.id ?? null,
    };
    db.orders.unshift(order);
    record.completed = true;
    // SIMULATED: the backend's order.placed subscriber spends redeemed points and adds earned ones
    if (customer) {
      customer.giftPoints = customer.giftPoints - totals.pointsRedeemed + order.pointsEarned;
    }
    persist();

    const body: CompleteCartResponse = { type: 'order', order: toOrderDTO(order) };
    return HttpResponse.json(body);
  }),
];
