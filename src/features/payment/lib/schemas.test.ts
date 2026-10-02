import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cardSchema, upiSchema, walletSchema } from './schemas';

const validCard = {
  cardNumber: '4111-1111-1111-1111',
  nameOnCard: 'Asha Rao',
  cvv: '123',
  expiry: '12/2027',
};

function cardErrors(overrides: Partial<typeof validCard>): string[] {
  const result = cardSchema.safeParse({ ...validCard, ...overrides });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('cardSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a valid card', () => {
    expect(cardErrors({})).toEqual([]);
  });

  it('validates the card number', () => {
    expect(cardErrors({ cardNumber: '' })).toContain('Enter your card number');
    expect(cardErrors({ cardNumber: '4111-1111' })).toContain('Card number must have 16 digits');
    expect(cardErrors({ cardNumber: '4111-1111-1111-111a' })).toContain(
      'Card number must have 16 digits'
    );
    expect(cardErrors({ cardNumber: '4111-1111-1111-1112' })).toEqual([
      'Enter a valid card number',
    ]);
  });

  it('validates the name', () => {
    expect(cardErrors({ nameOnCard: ' A ' })).toContain('Enter the name as shown on the card');
    expect(cardErrors({ nameOnCard: 'R2D2' })).toEqual(['Use letters only']);
  });

  it('validates the CVV', () => {
    expect(cardErrors({ cvv: '12' })).toEqual(['CVV must be 3 digits']);
    expect(cardErrors({ cvv: '12a' })).toEqual(['CVV must be 3 digits']);
  });

  it('validates the expiry', () => {
    expect(cardErrors({ expiry: '' })).toContain('Enter the expiry date');
    expect(cardErrors({ expiry: '13/2027' })).toEqual(['Use the format MM/YYYY']);
    expect(cardErrors({ expiry: '09/2026' })).toEqual(['This card has expired']);
    expect(cardErrors({ expiry: '10/2026' })).toEqual([]);
  });
});

describe('upiSchema', () => {
  it.each(['asha@okaxis', 'asha.rao-1@ybl'])('accepts %s', (upiId) => {
    expect(upiSchema.safeParse({ upiId }).success).toBe(true);
  });

  it.each([
    ['', 'Enter your UPI ID'],
    ['asha', 'Enter a UPI ID like name@bank'],
    ['asha@', 'Enter a UPI ID like name@bank'],
    ['@bank', 'Enter a UPI ID like name@bank'],
    ['asha@bank1', 'Enter a UPI ID like name@bank'],
  ])('rejects "%s"', (upiId, message) => {
    const result = upiSchema.safeParse({ upiId });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(message);
  });
});

describe('walletSchema', () => {
  it('accepts a known wallet', () => {
    expect(walletSchema.safeParse({ wallet: 'paytm' }).success).toBe(true);
  });

  it('rejects an empty choice', () => {
    const result = walletSchema.safeParse({ wallet: '' });
    expect(result.error?.issues[0]?.message).toBe('Choose a wallet');
  });
});
