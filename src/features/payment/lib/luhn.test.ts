import { describe, expect, it } from 'vitest';
import { passesLuhn } from './luhn';

describe('passesLuhn', () => {
  it.each(['4111111111111111', '5555555555554444', '4000000000000002', '0'])(
    'accepts %s',
    (digits) => {
      expect(passesLuhn(digits)).toBe(true);
    }
  );

  it.each(['4111111111111112', '1234567812345678', '79'])('rejects %s', (digits) => {
    expect(passesLuhn(digits)).toBe(false);
  });

  it('rejects empty input and non-digits', () => {
    expect(passesLuhn('')).toBe(false);
    expect(passesLuhn('4111-1111-1111-1111')).toBe(false);
  });
});
