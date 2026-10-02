/**
 * Domain types for the catalog feature
 */

export type Author = {
  name: string;
  slug: string;
};

export type Publisher = {
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  handle: string;
};

export type BookFormat = 'Paperback' | 'Hardcover' | 'eBook';

export type Book = {
  id: string;
  handle: string;
  title: string;
  subtitle?: string;
  author: Author;
  publisher?: Publisher;
  description: string;
  format: BookFormat;
  categories: Category[];
  language: string;
  priceInr: number;
  coverUrl: string;
  backCoverUrl?: string;
  rating?: number; // 0-5
  soldCount?: number;
  variantId: string;
};

export type Filters = {
  search: string;
  language: string; // 'all' | 'english' | 'hindi' | ...
  format: string; // 'all' | 'paperback' | 'hardcover' | 'ebook'
  priceMin: number;
  priceMax: number;
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'bestselling';
  category: string; // from URL or sidebar
};

export const DEFAULT_FILTERS: Filters = {
  search: '',
  language: 'all',
  format: 'all',
  priceMin: 0,
  priceMax: 10000,
  sortBy: 'relevance',
  category: 'all',
};
