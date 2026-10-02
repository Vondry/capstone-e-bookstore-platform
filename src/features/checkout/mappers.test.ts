import { describe, expect, it } from 'vitest';
import type { Address } from './types';
import { fromMedusaAddress, toMedusaAddress } from './mappers';

const address: Address = {
  firstName: 'Ravi',
  lastName: 'Kumar',
  address: '4 Park Street',
  email: 'ravi@example.com',
  city: 'Kolkata',
  pin: '700016',
  phoneCountryCode: '+977',
  phone: '9876543210',
  state: 'West Bengal',
  country: 'Nepal',
};

describe('address mappers', () => {
  it('maps the form to Medusa fields', () => {
    expect(toMedusaAddress(address)).toEqual({
      first_name: 'Ravi',
      last_name: 'Kumar',
      address_1: '4 Park Street',
      city: 'Kolkata',
      postal_code: '700016',
      province: 'West Bengal',
      country_code: 'np',
      phone: '+977 9876543210',
    });
  });

  it('round-trips, with the e-mail coming from the cart', () => {
    expect(fromMedusaAddress(toMedusaAddress(address), address.email)).toEqual(address);
  });

  it('defaults a phone without a country code to +91 and an unknown country to India', () => {
    const mapped = fromMedusaAddress(
      { ...toMedusaAddress(address), phone: '9876543210', country_code: 'xx' },
      ''
    );
    expect(mapped.phoneCountryCode).toBe('+91');
    expect(mapped.phone).toBe('9876543210');
    expect(mapped.country).toBe('India');
  });

  it('fills an empty Medusa address with form defaults', () => {
    expect(fromMedusaAddress({}, 'a@b.in')).toEqual({
      firstName: '',
      lastName: '',
      address: '',
      email: 'a@b.in',
      city: '',
      pin: '',
      phoneCountryCode: '+91',
      phone: '',
      state: '',
      country: 'India',
    });
  });

  it('keeps a phone number saved without a country code, and maps unknown countries to India', () => {
    const mapped = fromMedusaAddress({ phone: '9876543210', country_code: 'us' }, '');
    expect(mapped.phoneCountryCode).toBe('+91');
    expect(mapped.phone).toBe('9876543210');
    expect(mapped.country).toBe('India');
    expect(toMedusaAddress({ ...address, country: 'Atlantis' }).country_code).toBe('in');
  });
});
