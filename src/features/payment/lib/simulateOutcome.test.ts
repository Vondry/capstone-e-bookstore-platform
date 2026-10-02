import { describe, expect, it } from 'vitest';
import { DECLINED_MESSAGE, simulatePaymentOutcome } from './simulateOutcome';

const card = { nameOnCard: 'Asha Rao', cvv: '123', expiry: '12/2030' };

describe('simulatePaymentOutcome', () => {
  it('declines the test card for credit and debit', () => {
    expect(
      simulatePaymentOutcome({
        method: 'credit-card',
        details: { ...card, cardNumber: '4000-0000-0000-0002' },
      })
    ).toEqual({ ok: false, message: DECLINED_MESSAGE });
    expect(
      simulatePaymentOutcome({
        method: 'debit-card',
        details: { ...card, cardNumber: '4000000000000002' },
      })
    ).toEqual({ ok: false, message: DECLINED_MESSAGE });
  });

  it('approves other cards', () => {
    expect(
      simulatePaymentOutcome({
        method: 'credit-card',
        details: { ...card, cardNumber: '4111-1111-1111-1111' },
      })
    ).toEqual({ ok: true });
  });

  it('approves UPI and wallet payments', () => {
    expect(simulatePaymentOutcome({ method: 'upi', details: { upiId: 'asha@okaxis' } })).toEqual({
      ok: true,
    });
    expect(simulatePaymentOutcome({ method: 'wallet', details: { wallet: 'paytm' } })).toEqual({
      ok: true,
    });
  });
});
