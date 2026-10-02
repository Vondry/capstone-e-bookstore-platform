/**
 * Card expiry ("MM/YYYY") parsing. A card is valid through the last day of its expiry month.
 */

export type Expiry = { month: number; year: number };

export function parseExpiry(value: string): Expiry | null {
  const match = /^(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

/** True when the expiry month is the current month or later */
export function isExpiryCurrent(value: string, now: Date = new Date()): boolean {
  const expiry = parseExpiry(value);
  if (!expiry) return false;
  const currentYear = now.getFullYear();
  if (expiry.year !== currentYear) return expiry.year > currentYear;
  return expiry.month >= now.getMonth() + 1;
}
