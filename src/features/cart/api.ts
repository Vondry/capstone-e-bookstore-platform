/**
 * Cart API — Medusa store carts, promotions, shipping, payment and checkout (plan 14).
 * Mock mode: answered by MSW (src/mocks/handlers/cart.ts) in the same shapes.
 * Docs: https://docs.medusajs.com/resources/references/js-sdk/store/cart
 *       https://docs.medusajs.com/resources/storefront-development/checkout
 */

import type { HttpTypes } from '@medusajs/types';
import { AUTH_TOKEN_KEY, FetchError, isHttpError, REGION_ID, sdk } from '@/lib/medusa';
import type { CartDTO, CartResponse } from '@/lib/storeTypes';
import { saveAddress } from '../auth/api';
import { fetchBooksByIds } from '../catalog/api';
import { toMedusaAddress } from '../checkout/mappers';
import { validateCoupon } from '../checkout/lib/totals';
import type { Address, PaymentMethod } from '../checkout/types';
import { asOrderDTO, ORDER_FIELDS, toOrder } from '../orders/mappers';
import type { Order } from '../orders/types';
import { CART_FIELDS, productIds, requiresShipping, toCart } from './mappers';
import type { Cart } from './types';

const CART_ID_KEY = 'bw.cartId';
const DEFAULT_COUNTRY = 'in';
const query = { fields: CART_FIELDS };

/** SIMULATED: Medusa's manual payment provider; the card/UPI/wallet form only runs in the browser */
const PAYMENT_PROVIDER_ID = 'pp_system_default';

export function getStoredCartId(): string | null {
  try {
    return localStorage.getItem(CART_ID_KEY);
  } catch {
    return null;
  }
}

export function setStoredCartId(id: string | null): void {
  try {
    if (id) localStorage.setItem(CART_ID_KEY, id);
    else localStorage.removeItem(CART_ID_KEY);
  } catch {
    // Storage unavailable
  }
}

function asCartDTO(cart: HttpTypes.StoreCart): CartDTO {
  return { ...cart, items: cart.items ?? [], shipping_methods: cart.shipping_methods ?? [] };
}

async function toDomainCart(cart: HttpTypes.StoreCart): Promise<Cart> {
  const dto = asCartDTO(cart);
  return toCart(dto, await fetchBooksByIds(productIds(dto.items)));
}

/** Returns the current cart, or null when the visitor has none yet */
export async function fetchCart(): Promise<Cart | null> {
  const id = getStoredCartId();
  if (!id) return null;
  try {
    const { cart } = await sdk.store.cart.retrieve(id, query);
    return await toDomainCart(cart);
  } catch (error) {
    // Unknown or completed cart: start fresh. Other errors surface so the UI can offer a retry.
    if (isHttpError(error, 404)) {
      setStoredCartId(null);
      return null;
    }
    throw error;
  }
}

/**
 * Gives a guest's cart to the customer who just logged in. Medusa only links a cart to a customer
 * when it's created while logged in, and gift points and order history need that link.
 * A cart Medusa won't transfer (gone, completed, or another customer's) is forgotten; any other
 * failure keeps it, so logging in never fails because of the cart.
 */
export async function transferStoredCart(): Promise<void> {
  const id = getStoredCartId();
  if (!id) return;
  try {
    await sdk.store.cart.transferCart(id);
  } catch (error) {
    const status = isHttpError(error) ? (error.status ?? 0) : 0;
    if (status >= 400 && status < 500) {
      setStoredCartId(null);
    }
  }
}

// Shared while a cart is being created, so concurrent first adds land in the same cart
let pendingCartId: Promise<string> | null = null;

async function ensureCartId(): Promise<string> {
  const existing = getStoredCartId();
  if (existing) return existing;
  pendingCartId ??= sdk.store.cart
    // The region spans four countries; starting in India lets Medusa calculate GST before checkout
    .create({ region_id: REGION_ID, shipping_address: { country_code: DEFAULT_COUNTRY } }, query)
    .then(({ cart }) => {
      setStoredCartId(cart.id);
      return cart.id;
    })
    .finally(() => {
      pendingCartId = null;
    });
  return pendingCartId;
}

/**
 * Medusa charges delivery exactly when a shipping method is on the cart. Add the standard option
 * as soon as the cart holds a physical book, so the Grand Total shows delivery from the start, and
 * remove it once only eBooks are left (Medusa keeps it otherwise; custom route, see
 * docs/api/openapi.yaml). Before an address exists the backend may not offer an option yet;
 * checkout then requires it.
 */
async function syncShippingMethod(
  cart: HttpTypes.StoreCart,
  { required = false } = {}
): Promise<HttpTypes.StoreCart> {
  const dto = asCartDTO(cart);
  const needsShipping = requiresShipping(dto);
  const hasMethod = dto.shipping_methods.length > 0;
  if (needsShipping === hasMethod) return cart;
  try {
    if (!needsShipping) {
      const { cart: updated } = await sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(
        `/store/carts/${cart.id}/shipping-methods`,
        { method: 'DELETE', query }
      );
      return updated;
    }
    const { shipping_options: options } = await sdk.store.fulfillment.listCartOptions({
      cart_id: cart.id,
    });
    const option = options[0];
    if (!option) throw new FetchError('No delivery option is available', '', 400);
    const { cart: updated } = await sdk.store.cart.addShippingMethod(
      cart.id,
      { option_id: option.id },
      query
    );
    return updated;
  } catch (error) {
    if (required) throw error;
    return cart;
  }
}

export async function addLineItem(variantId: string, quantity = 1): Promise<Cart> {
  const cartId = await ensureCartId();
  const { cart } = await sdk.store.cart.createLineItem(
    cartId,
    { variant_id: variantId, quantity },
    query
  );
  return toDomainCart(await syncShippingMethod(cart));
}

export async function updateLineItem(lineId: string, quantity: number): Promise<Cart> {
  const cartId = await ensureCartId();
  const { cart } = await sdk.store.cart.updateLineItem(cartId, lineId, { quantity }, query);
  return toDomainCart(cart);
}

export async function removeLineItem(lineId: string): Promise<Cart> {
  const cartId = await ensureCartId();
  const { parent } = await sdk.store.cart.deleteLineItem(cartId, lineId, query);
  if (!parent) throw new FetchError('The cart could not be updated', '', 500);
  return toDomainCart(await syncShippingMethod(parent));
}

export type CartUpdate = {
  shippingAddress?: Address;
  /** Redeem gift points (Loyalty module, custom route) */
  redeemPoints?: boolean;
};

export async function updateCart(update: CartUpdate): Promise<Cart> {
  const cartId = await ensureCartId();
  let { cart } = await sdk.store.cart.retrieve(cartId, query);

  if (update.shippingAddress) {
    ({ cart } = await sdk.store.cart.update(
      cartId,
      {
        email: update.shippingAddress.email,
        shipping_address: toMedusaAddress(update.shippingAddress),
      },
      query
    ));
    cart = await syncShippingMethod(cart);
  }

  if (update.redeemPoints !== undefined) {
    const response = await sdk.client.fetch<CartResponse>(`/store/carts/${cartId}/loyalty-points`, {
      method: update.redeemPoints ? 'POST' : 'DELETE',
      query,
    });
    return toCart(response.cart, await fetchBooksByIds(productIds(response.cart.items)));
  }

  return toDomainCart(cart);
}

/** The S4 message for a coupon that wasn't applied (same rules as the backend's promotions) */
function couponError(code: string, subtotal: number): FetchError {
  const result = validateCoupon(code, subtotal);
  const message = result.ok ? "This coupon can't be used on this cart" : result.reason;
  return new FetchError(message, 'Bad Request', 400);
}

/**
 * Throws with a readable message when the code isn't applied. Medusa rejects unknown codes
 * (400 "The promotion code … is invalid") but silently skips codes whose rules don't match
 * (e.g. the ₹300 minimum), so the result is checked as well.
 */
export async function applyCoupon(input: string): Promise<Cart> {
  const cartId = await ensureCartId();
  // Medusa promotion codes are case-sensitive and ours are all upper case
  const code = input.trim().toUpperCase();
  try {
    const { cart } = await sdk.store.cart.addPromotions(cartId, { promo_codes: [code] }, query);
    const applied = cart.promotions.some((promotion) => promotion.code === code);
    if (!applied) throw couponError(code, cart.item_subtotal);
    return await toDomainCart(cart);
  } catch (error) {
    if (isHttpError(error, 400) && /is invalid/i.test(error.message)) throw couponError(code, 0);
    throw error;
  }
}

export async function removeCoupon(): Promise<Cart> {
  const cartId = await ensureCartId();
  const current = await fetchCart();
  const code = current?.couponCode;
  if (!current || !code) {
    if (current) return current;
    throw new FetchError('Cart not found', 'Not Found', 404);
  }
  const { cart } = await sdk.store.cart.removePromotions(cartId, { promo_codes: [code] }, query);
  return toDomainCart(cart);
}

function isLoggedIn(): boolean {
  try {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  } catch {
    return false;
  }
}

/** Medusa doesn't keep checkout addresses; save a customer's first one for "Use Saved Address" */
async function rememberAddress(address: Address): Promise<void> {
  if (!isLoggedIn()) return;
  try {
    const { customer } = await sdk.store.customer.retrieve({ fields: '*addresses' });
    if (customer.addresses.length === 0) await saveAddress(address);
  } catch {
    // Not essential: the order is already placed
  }
}

/**
 * Places the order: records the chosen method, makes sure delivery is set, starts the
 * (manual) payment and completes the cart. Only the payment *method* is sent — card details
 * never leave the payment form (see .bob/rules/04-code-quality.md).
 */
export async function completeCart(paymentMethod: PaymentMethod): Promise<Order> {
  const cartId = await ensureCartId();
  const { cart: current } = await sdk.store.cart.retrieve(cartId, query);
  let { cart } = await sdk.store.cart.update(
    cartId,
    // Medusa replaces metadata, so keep what's there (e.g. the gift-points promotion)
    { metadata: { ...current.metadata, payment_method: paymentMethod } },
    query
  );
  cart = await syncShippingMethod(cart, { required: true });
  await sdk.store.payment.initiatePaymentSession(cart, { provider_id: PAYMENT_PROVIDER_ID });

  const result = await sdk.store.cart.complete(cartId, { fields: ORDER_FIELDS });
  if (result.type === 'cart') throw new FetchError(result.error.message, 'Bad Request', 400);

  setStoredCartId(null);
  const order = asOrderDTO(result.order);
  const domainOrder = toOrder(order, await fetchBooksByIds(productIds(order.items)));
  await rememberAddress(domainOrder.shippingAddress);
  return domainOrder;
}
