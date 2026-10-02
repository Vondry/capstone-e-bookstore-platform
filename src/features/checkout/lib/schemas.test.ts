import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { Address } from '../types';
import { addressSchema, emptyAddress } from './schemas';

const valid: Address = {
  firstName: 'Asha',
  lastName: 'Verma',
  address: '12 MG Road',
  email: 'asha@example.com',
  city: 'Bengaluru',
  pin: '560038',
  phoneCountryCode: '+91',
  phone: '9876543210',
  state: 'Karnataka',
  country: 'India',
};

function errorFor(input: Partial<Address>, field: keyof Address): string | undefined {
  const result = addressSchema.safeParse({ ...valid, ...input });
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe('addressSchema', () => {
  it('accepts a valid address and trims values', () => {
    const result = addressSchema.safeParse({ ...valid, city: '  Bengaluru  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.city).toBe('Bengaluru');
  });

  it('requires every text field', () => {
    const result = addressSchema.safeParse(emptyAddress);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = z.flattenError(result.error).fieldErrors;
      expect(new Set(Object.keys(errors))).toEqual(
        new Set(['address', 'city', 'email', 'firstName', 'lastName', 'phone', 'pin', 'state'])
      );
      expect(errors.firstName?.[0]).toBe('Enter your first name');
    }
  });

  it('rejects whitespace-only and over-long values', () => {
    expect(errorFor({ lastName: '   ' }, 'lastName')).toBe('Enter your last name');
    expect(errorFor({ address: 'x'.repeat(121) }, 'address')).toBe(
      'Keep this under 120 characters'
    );
  });

  it('validates the e-mail', () => {
    expect(errorFor({ email: '' }, 'email')).toBe('Enter your e-mail');
    expect(errorFor({ email: 'asha@' }, 'email')).toBe(
      'Enter a valid e-mail, e.g. name@example.com'
    );
  });

  it.each(['56003', '5600381', '56003a', ''])('rejects pin "%s"', (pin) => {
    expect(errorFor({ pin }, 'pin')).toBe('Pin must be 6 digits');
  });

  it.each(['987654321', '98765432100', '98765-4321', ''])('rejects phone "%s"', (phone) => {
    expect(errorFor({ phone }, 'phone')).toBe('Phone number must be 10 digits');
  });

  it('only accepts listed countries and phone codes', () => {
    expect(errorFor({ country: 'Atlantis' }, 'country')).toBe('Choose a country');
    expect(errorFor({ phoneCountryCode: '+1' }, 'phoneCountryCode')).toBe('Choose a country code');
    expect(errorFor({ country: 'Nepal', phoneCountryCode: '+977' }, 'country')).toBeUndefined();
  });

  it('defaults the empty address to India / +91', () => {
    expect(emptyAddress.country).toBe('India');
    expect(emptyAddress.phoneCountryCode).toBe('+91');
  });
});
