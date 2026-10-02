/**
 * The seed catalogue: one source of truth for the MSW mock backend (src/mocks) and the
 * Medusa seed script (backend/), so mock mode and live mode show the same books.
 * Plain data only — no imports from the app or the backend.
 */

import booksJson from './books.json';
import categoriesJson from './categories.json';
import demoJson from './demo.json';
import publishersJson from './publishers.json';
import writersJson from './writers.json';

export { makeAvatar, makeCover } from './artwork';

export type SeedFormat = 'Paperback' | 'Hardcover' | 'eBook';

export type SeedBook = {
  handle: string;
  title: string;
  subtitle?: string;
  /** Writer slug (writers.json) */
  author: string;
  /** Publisher slug (publishers.json) */
  publisher: string | null;
  description: string;
  format: SeedFormat;
  language: string;
  /** Category handles (categories.json); the first is the breadcrumb's top level */
  categories: string[];
  priceInr: number;
  rating: number | null;
  soldCount: number | null;
  /** Shown under "New Launches" (the seed gives these the newest created date) */
  isNewLaunch: boolean;
  /** Cover artwork colours: background, foreground */
  cover: [string, string];
};

export type SeedCategory = { handle: string; name: string };
export type SeedWriter = { slug: string; name: string; bio: string[] };
export type SeedPublisher = { slug: string; name: string; description: string };

export type SeedAddress = {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  city: string;
  pin: string;
  phoneCountryCode: string;
  phone: string;
  state: string;
  country: string;
};

export type SeedDemo = {
  customer: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    giftPoints: number;
  };
  address: SeedAddress;
  orders: {
    displayId: number;
    hoursAgo: number;
    books: string[];
    paymentMethod: 'credit-card' | 'debit-card' | 'upi' | 'wallet';
    note: string;
  }[];
};

export const seedBooks = booksJson as SeedBook[];
export const seedCategories: SeedCategory[] = categoriesJson;
export const seedWriters: SeedWriter[] = writersJson;
export const seedPublishers: SeedPublisher[] = publishersJson;
export const seedDemo = demoJson as SeedDemo;
