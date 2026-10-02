/**
 * Medusa customer DTO (+ loyalty balance) → domain `Customer`
 */

import type { HttpTypes } from '@medusajs/types';
import { fromMedusaAddress } from '../checkout/mappers';
import type { Customer } from './types';

export function toCustomer(customer: HttpTypes.StoreCustomer, giftPoints: number): Customer {
  const saved =
    customer.addresses.find((address) => address.is_default_shipping) ?? customer.addresses[0];
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.first_name ?? '',
    lastName: customer.last_name ?? '',
    savedAddress: saved ? fromMedusaAddress(saved, customer.email) : null,
    giftPoints,
  };
}
