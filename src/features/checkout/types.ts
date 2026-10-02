/**
 * Checkout domain types shared by cart, payment, orders and auth
 */

export type Address = {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  city: string;
  pin: string;
  phoneCountryCode: string;
  phone: string;
  state: string;
  country: string;
};

export type PaymentMethod = 'credit-card' | 'debit-card' | 'upi' | 'wallet';

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  tax: number;
  delivery: number;
  discount: number;
  pointsRedeemed: number;
  total: number;
};
