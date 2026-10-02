/**
 * Input masks for the card form (pure, no React).
 */

export const CARD_NUMBER_DIGITS = 16;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** "4111111111111111" → "4111-1111-1111-1111" (max 16 digits, extra input is dropped) */
export function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, CARD_NUMBER_DIGITS);
  return digits.match(/.{1,4}/g)?.join('-') ?? '';
}

/** "122030" → "12/2030"; inserts the slash after the month (max 6 digits) */
export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 6);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/** "123" → "123"; keeps at most 3 digits */
export function formatCvv(value: string): string {
  return digitsOnly(value).slice(0, 3);
}
