import type { Book } from '../catalog/types';
import type { Address, CartTotals, PaymentMethod } from '../checkout/types';

/** SIMULATED: 'cancellation_requested' — there is no store-side cancel in Medusa */
export type OrderStatus = 'placed' | 'cancellation_requested';

export type OrderLine = {
  id: string;
  book: Book;
  quantity: number;
  unitPriceInr: number;
};

export type Order = {
  id: string;
  displayId: number;
  createdAt: string; // ISO date
  status: OrderStatus;
  email: string;
  lines: OrderLine[];
  totals: CartTotals;
  pointsEarned: number;
  shippingAddress: Address;
  /** Kept in order metadata, which Medusa's store API doesn't return, so often unknown */
  paymentMethod: PaymentMethod | null;
};
