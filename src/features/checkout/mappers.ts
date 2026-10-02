/**
 * S4 address form ↔ Medusa address (docs/data-model.md → Member). The e-mail lives on the cart.
 */

import type { Address } from './types';

/** Country select labels (lib/schemas.ts) ↔ ISO codes Medusa stores */
const COUNTRY_CODES: Record<string, string> = {
  India: 'in',
  Nepal: 'np',
  Bhutan: 'bt',
  'Sri Lanka': 'lk',
};

const DEFAULT_PHONE_CODE = '+91';

export type MedusaAddressFields = {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
  province: string;
  country_code: string;
  phone: string;
};

/** Any Medusa address (cart, order or customer): empty fields are null on some, absent on others */
type MedusaAddressLike = {
  [Key in keyof MedusaAddressFields]?: string | null;
};

export function toMedusaAddress(address: Address): MedusaAddressFields {
  return {
    first_name: address.firstName,
    last_name: address.lastName,
    address_1: address.address,
    city: address.city,
    postal_code: address.pin,
    province: address.state,
    country_code: COUNTRY_CODES[address.country] ?? 'in',
    // "+91 9876543210": code and number in one field, split again on the way back
    phone: `${address.phoneCountryCode} ${address.phone}`,
  };
}

export function fromMedusaAddress(address: MedusaAddressLike, email: string): Address {
  const [code, ...rest] = (address.phone ?? '').trim().split(/\s+/);
  const hasCode = code?.startsWith('+') ?? false;
  const country =
    Object.entries(COUNTRY_CODES).find(([, iso]) => iso === address.country_code)?.[0] ?? 'India';
  return {
    firstName: address.first_name ?? '',
    lastName: address.last_name ?? '',
    address: address.address_1 ?? '',
    email,
    city: address.city ?? '',
    pin: address.postal_code ?? '',
    phoneCountryCode: hasCode && code ? code : DEFAULT_PHONE_CODE,
    phone: hasCode ? rest.join('') : (address.phone ?? ''),
    state: address.province ?? '',
    country,
  };
}
