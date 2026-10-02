import type { PaymentMethod } from '../../checkout/types';

/** Tab order and labels, as in the wireframe */
export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'credit-card', label: 'Credit Card' },
  { id: 'debit-card', label: 'Debit card' },
  { id: 'upi', label: 'UPI' },
  { id: 'wallet', label: 'Wallet' },
];
