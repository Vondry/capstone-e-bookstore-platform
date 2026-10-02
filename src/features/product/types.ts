/**
 * Domain types for the product detail feature (S3)
 */

/** SIMULATED: Medusa has no writers module; profiles come from a mocked store route */
export type Writer = {
  slug: string;
  name: string;
  /** One entry per paragraph */
  bio: string[];
  avatarUrl: string;
};

/** SIMULATED: reviews are stored locally per book (see lib/reviews.ts) */
export type Review = {
  id: string;
  name: string;
  text: string;
  rating: number;
  createdAt: string;
};
