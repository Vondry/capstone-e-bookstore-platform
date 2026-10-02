/**
 * SIMULATED: Medusa has no reviews in the store API. Reviews are kept in localStorage per
 * book handle (key `bw.reviews.{handle}`), visible only in this browser. Newest first.
 */

import type { Review } from '../types';
import type { ReviewInput } from './schemas';

export function reviewsStorageKey(handle: string): string {
  return `bw.reviews.${handle}`;
}

function isReview(value: unknown): value is Review {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.text === 'string' &&
    typeof record.rating === 'number' &&
    typeof record.createdAt === 'string'
  );
}

export function loadReviews(handle: string): Review[] {
  try {
    const raw = localStorage.getItem(reviewsStorageKey(handle));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isReview) : [];
  } catch {
    return [];
  }
}

export function createReview(input: ReviewInput, name: string, now: Date = new Date()): Review {
  return {
    id: crypto.randomUUID(),
    name,
    text: input.text.trim(),
    rating: input.rating,
    createdAt: now.toISOString(),
  };
}

/** Prepends the review and persists the list; returns the new list */
export function saveReview(handle: string, review: Review): Review[] {
  const next = [review, ...loadReviews(handle)];
  try {
    localStorage.setItem(reviewsStorageKey(handle), JSON.stringify(next));
  } catch {
    // Storage unavailable: the review is shown for this visit only
  }
  return next;
}

/** "Priya N." for a customer, "Guest reader" otherwise */
export function reviewerName(
  customer: { firstName: string; lastName: string } | null | undefined
): string {
  if (!customer?.firstName) return 'Guest reader';
  const initial = customer.lastName ? ` ${customer.lastName.charAt(0)}.` : '';
  return `${customer.firstName}${initial}`;
}
