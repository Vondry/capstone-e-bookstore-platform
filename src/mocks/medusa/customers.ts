/**
 * SIMULATED: Medusa `StoreCustomer` DTOs from the mock customer records
 */

import type { HttpTypes } from '@medusajs/types';
import { toMedusaAddress } from '../../features/checkout/mappers';
import type { CustomerRecord } from '../db';

const SEED_DATE = new Date(Date.UTC(2026, 0, 1)).toISOString();

export function toCustomerDTO(record: CustomerRecord): HttpTypes.StoreCustomer {
  const addressId = `caddr_${record.id}`;
  const addresses: HttpTypes.StoreCustomerAddress[] = record.savedAddress
    ? [
        {
          id: addressId,
          ...toMedusaAddress(record.savedAddress),
          address_2: null,
          address_name: null,
          company: null,
          is_default_shipping: true,
          is_default_billing: true,
          customer_id: record.id,
          metadata: null,
          created_at: SEED_DATE,
          updated_at: SEED_DATE,
        },
      ]
    : [];
  return {
    id: record.id,
    email: record.email,
    first_name: record.firstName,
    last_name: record.lastName,
    company_name: null,
    phone: null,
    default_billing_address_id: record.savedAddress ? addressId : null,
    default_shipping_address_id: record.savedAddress ? addressId : null,
    addresses,
  };
}
