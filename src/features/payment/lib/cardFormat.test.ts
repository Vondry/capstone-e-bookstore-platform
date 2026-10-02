import { describe, expect, it } from 'vitest';
import { digitsOnly, formatCardNumber, formatCvv, formatExpiry } from './cardFormat';

describe('digitsOnly', () => {
  it('strips everything but digits', () => {
    expect(digitsOnly('41a1-1 1')).toBe('41111');
  });
});

describe('formatCardNumber', () => {
  it('groups digits in fours with dashes', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111-1111-1111-1111');
  });

  it('formats partial input without a trailing dash', () => {
    expect(formatCardNumber('41111')).toBe('4111-1');
    expect(formatCardNumber('4111')).toBe('4111');
  });

  it('drops non-digits and digits beyond 16', () => {
    expect(formatCardNumber('4111 1111-1111x1111 99')).toBe('4111-1111-1111-1111');
  });

  it('returns an empty string for no digits', () => {
    expect(formatCardNumber('abc')).toBe('');
  });
});

describe('formatExpiry', () => {
  it('inserts the slash after the month', () => {
    expect(formatExpiry('122030')).toBe('12/2030');
    expect(formatExpiry('123')).toBe('12/3');
  });

  it('leaves 1–2 digits alone and caps at 6 digits', () => {
    expect(formatExpiry('1')).toBe('1');
    expect(formatExpiry('12')).toBe('12');
    expect(formatExpiry('12/20301')).toBe('12/2030');
  });
});

describe('formatCvv', () => {
  it('keeps at most 3 digits', () => {
    expect(formatCvv('1a234')).toBe('123');
  });
});
