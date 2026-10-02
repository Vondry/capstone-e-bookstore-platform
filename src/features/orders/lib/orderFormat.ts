/**
 * Display helpers for the order history (S7)
 */

import type { OrderStatus } from '../types';

const weekdayFormat = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
const monthFormat = new Intl.DateTimeFormat('en-IN', { month: 'short' });

/** "Thu, 1 Oct 2026" (composed so the output does not depend on ICU punctuation) */
export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  return `${weekdayFormat.format(date)}, ${String(date.getDate())} ${monthFormat.format(date)} ${String(date.getFullYear())}`;
}

/** "1 item" / "3 items" */
export function formatItemCount(count: number): string {
  return `${String(count)} ${count === 1 ? 'item' : 'items'}`;
}

/** SIMULATED status: a request is never shown as "Cancelled" */
export function orderStatusLabel(status: OrderStatus): string {
  return status === 'placed' ? 'Placed' : 'Cancellation requested';
}

/** "You can cancel for another 45 h" */
export function formatCancelHint(hoursLeft: number): string {
  return `You can cancel for another ${String(hoursLeft)} h`;
}
