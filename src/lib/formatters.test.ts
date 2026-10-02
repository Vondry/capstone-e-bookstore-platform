import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatDeliveryDate, formatPrice } from './formatters';

describe('formatPrice', () => {
  it('formats rupees without decimals for prices and with two for totals', () => {
    expect(formatPrice(399)).toBe('₹399');
    expect(formatPrice(508, true)).toBe('₹508.00');
    expect(formatCurrency(1234.5, true)).toBe('₹1,234.50');
  });
});

describe('formatDate', () => {
  const date = new Date(2026, 6, 21); // Tue 21 Jul 2026

  it('supports every style, medium by default', () => {
    expect(formatDate(date)).toBe('21 Jul 2026');
    expect(formatDate(date, 'short')).toBe('21 Jul');
    expect(formatDate(date, 'long')).toBe('Tue, 21 Jul, 2026');
    expect(formatDate(date, 'weekday')).toBe('Tue, 21 Jul');
  });

  it('accepts ISO strings', () => {
    expect(formatDate('2026-07-21T10:00:00', 'short')).toBe('21 Jul');
  });
});

describe('formatDeliveryDate', () => {
  it('is instant for eBooks', () => {
    expect(formatDeliveryDate('eBook')).toBe('Instant');
  });

  it('adds three business days', () => {
    // Wed → Mon (skips Sat and Sun)
    expect(formatDeliveryDate('Paperback', new Date(2026, 6, 15))).toBe('Mon, 20 Jul');
    // Mon → Thu
    expect(formatDeliveryDate('Hardcover', '2026-07-20T09:00:00')).toBe('Thu, 23 Jul');
  });
});
