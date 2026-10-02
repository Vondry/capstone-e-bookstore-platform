import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isExpiryCurrent, parseExpiry } from './expiry';

describe('parseExpiry', () => {
  it('parses MM/YYYY', () => {
    expect(parseExpiry('07/2030')).toEqual({ month: 7, year: 2030 });
  });

  it.each(['7/2030', '07/30', '00/2030', '13/2030', ''])('rejects %s', (value) => {
    expect(parseExpiry(value)).toBeNull();
  });
});

describe('isExpiryCurrent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 1)); // 1 Oct 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts the current month and later', () => {
    expect(isExpiryCurrent('10/2026')).toBe(true);
    expect(isExpiryCurrent('11/2026')).toBe(true);
    expect(isExpiryCurrent('01/2027')).toBe(true);
  });

  it('rejects past months and past years', () => {
    expect(isExpiryCurrent('09/2026')).toBe(false);
    expect(isExpiryCurrent('12/2025')).toBe(false);
  });

  it('rejects malformed values', () => {
    expect(isExpiryCurrent('13/2030')).toBe(false);
  });

  it('accepts an explicit "now"', () => {
    expect(isExpiryCurrent('10/2026', new Date(2026, 10, 1))).toBe(false);
  });
});
