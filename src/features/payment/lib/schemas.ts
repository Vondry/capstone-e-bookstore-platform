/**
 * Zod schemas for each payment method (one form per tab).
 */

import { z } from 'zod';
import type { WalletId } from '../types';
import { CARD_NUMBER_DIGITS, digitsOnly } from './cardFormat';
import { isExpiryCurrent, parseExpiry } from './expiry';
import { passesLuhn } from './luhn';

export const cardSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Enter your card number')
    .refine((value) => /^[\d-]+$/.test(value) && digitsOnly(value).length === CARD_NUMBER_DIGITS, {
      message: 'Card number must have 16 digits',
    })
    .refine((value) => passesLuhn(digitsOnly(value)), { message: 'Enter a valid card number' }),
  nameOnCard: z
    .string()
    .trim()
    .min(2, 'Enter the name as shown on the card')
    .regex(/^[A-Za-z][A-Za-z .'-]*$/, 'Use letters only'),
  cvv: z.string().regex(/^\d{3}$/, 'CVV must be 3 digits'),
  expiry: z
    .string()
    .min(1, 'Enter the expiry date')
    .refine((value) => parseExpiry(value) !== null, { message: 'Use the format MM/YYYY' })
    .refine((value) => parseExpiry(value) === null || isExpiryCurrent(value), {
      message: 'This card has expired',
    }),
});

export const upiSchema = z.object({
  upiId: z
    .string()
    .trim()
    .min(1, 'Enter your UPI ID')
    .regex(/^[A-Za-z0-9._-]{2,256}@[A-Za-z]{2,64}$/, 'Enter a UPI ID like name@bank'),
});

export const WALLETS: { value: WalletId; label: string }[] = [
  { value: 'paytm', label: 'Paytm' },
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'amazon-pay', label: 'Amazon Pay' },
  { value: 'mobikwik', label: 'MobiKwik' },
];

export const walletSchema = z.object({
  wallet: z.enum(['paytm', 'phonepe', 'amazon-pay', 'mobikwik'], { error: 'Choose a wallet' }),
});

export type CardFormValues = z.infer<typeof cardSchema>;
export type UpiFormValues = z.infer<typeof upiSchema>;
export type WalletFormValues = z.infer<typeof walletSchema>;
