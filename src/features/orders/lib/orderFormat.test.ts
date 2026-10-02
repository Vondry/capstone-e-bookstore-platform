import { describe, expect, it } from 'vitest';
import {
  formatCancelHint,
  formatItemCount,
  formatOrderDate,
  orderStatusLabel,
} from './orderFormat';

describe('orderFormat', () => {
  it('formats the placed date as "Thu, 1 Oct 2026"', () => {
    // Local noon avoids time-zone date shifts
    expect(formatOrderDate(new Date(2026, 9, 1, 12).toISOString())).toBe('Thu, 1 Oct 2026');
  });

  it('pluralises the item count', () => {
    expect(formatItemCount(1)).toBe('1 item');
    expect(formatItemCount(3)).toBe('3 items');
  });

  it('never labels a request as "Cancelled"', () => {
    expect(orderStatusLabel('placed')).toBe('Placed');
    expect(orderStatusLabel('cancellation_requested')).toBe('Cancellation requested');
  });

  it('formats the cancel hint', () => {
    expect(formatCancelHint(45)).toBe('You can cancel for another 45 h');
  });
});
