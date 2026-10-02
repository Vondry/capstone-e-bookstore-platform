import type { Book } from '../catalog/types';
import type { Address, CartTotals } from '../checkout/types';

export type CartLine = {
  id: string;
  book: Book;
  quantity: number;
};

export type Cart = {
  id: string;
  lines: CartLine[];
  couponCode: string | null;
  redeemPoints: boolean;
  shippingAddress: Address | null;
  totals: CartTotals;
};
