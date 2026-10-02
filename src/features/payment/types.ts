/**
 * Payment domain types. Card details only ever live in the mounted form's memory.
 */

import type { PaymentMethod } from '../checkout/types';

export type CardDetails = {
  cardNumber: string;
  nameOnCard: string;
  cvv: string;
  expiry: string;
};

export type UpiDetails = {
  upiId: string;
};

export type WalletId = 'paytm' | 'phonepe' | 'amazon-pay' | 'mobikwik';

export type WalletDetails = {
  wallet: WalletId;
};

export type PaymentSubmission =
  | { method: Extract<PaymentMethod, 'credit-card' | 'debit-card'>; details: CardDetails }
  | { method: 'upi'; details: UpiDetails }
  | { method: 'wallet'; details: WalletDetails };

export type PaymentOutcome = { ok: true } | { ok: false; message: string };
