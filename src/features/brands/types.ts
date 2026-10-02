/**
 * Brand browsing (deck journey 6): writers and publishers.
 * SIMULATED: Medusa has no writers or publishers module; these come from mocked store routes.
 */

export type { Writer } from '../product/types';

export type WriterSummary = {
  slug: string;
  name: string;
  avatarUrl: string;
  bookCount: number;
};

export type Publisher = {
  slug: string;
  name: string;
  description: string;
  bookCount: number;
};
