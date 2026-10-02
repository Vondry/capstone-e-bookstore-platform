/**
 * SIMULATED: payment authorisation. There is no payment gateway; the outcome is decided
 * client-side so card data never leaves the browser. Only the method is sent to the API.
 */

import type { PaymentOutcome, PaymentSubmission } from '../types';
import { digitsOnly } from './cardFormat';

/** SIMULATED: test card that is always declined (Luhn-valid) */
export const DECLINED_TEST_CARD = '4000000000000002';

export const DECLINED_MESSAGE = 'Your card was declined. Try another card or payment method.';

export function simulatePaymentOutcome(submission: PaymentSubmission): PaymentOutcome {
  switch (submission.method) {
    case 'credit-card':
    case 'debit-card':
      return digitsOnly(submission.details.cardNumber) === DECLINED_TEST_CARD
        ? { ok: false, message: DECLINED_MESSAGE }
        : { ok: true };
    case 'upi':
    case 'wallet':
      return { ok: true };
  }
}
