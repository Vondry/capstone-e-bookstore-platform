/**
 * SIMULATED: customers may request cancellation within 48 h of placing an order
 * (see .bob/rules/01 → Simulated features). The mock backend enforces the same window.
 */

import type { Order } from '../types';

export const CANCEL_WINDOW_HOURS = 48;

const HOUR_MS = 60 * 60 * 1000;
const CANCEL_WINDOW_MS = CANCEL_WINDOW_HOURS * HOUR_MS;

type CancellableOrder = Pick<Order, 'createdAt' | 'status'>;

/** Milliseconds since the order was placed (clamped to 0 for a future createdAt) */
function elapsedMs(order: CancellableOrder, now: Date): number {
  return Math.max(0, now.getTime() - new Date(order.createdAt).getTime());
}

/** True while the order is 'placed' and `now - createdAt < 48 h` */
export function canCancel(order: CancellableOrder, now: Date = new Date()): boolean {
  return order.status === 'placed' && elapsedMs(order, now) < CANCEL_WINDOW_MS;
}

/** Whole hours left to cancel (rounded up), or 0 when the order can no longer be cancelled */
export function hoursLeftToCancel(order: CancellableOrder, now: Date = new Date()): number {
  if (!canCancel(order, now)) return 0;
  return Math.ceil((CANCEL_WINDOW_MS - elapsedMs(order, now)) / HOUR_MS);
}
