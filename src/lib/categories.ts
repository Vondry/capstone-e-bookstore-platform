/**
 * Sidebar genres, in wireframe order (`01-home-catalogue.png`, .bob/rules/03-screens.md → S2).
 * Handles match the category handles in the catalogue data.
 */

export type SidebarCategory = {
  name: string;
  handle: string;
};

export const ALL_CATEGORY: SidebarCategory = { name: 'All', handle: 'all' };

export const categories: SidebarCategory[] = [
  { name: 'Romance', handle: 'romance' },
  { name: 'Mystery', handle: 'mystery' },
  { name: 'Science Fiction', handle: 'science-fiction' },
  { name: 'Fantasy', handle: 'fantasy' },
  { name: 'Historical', handle: 'historical' },
  { name: 'Biography', handle: 'biography' },
  { name: 'Self-help', handle: 'self-help' },
  { name: 'Memoir', handle: 'memoir' },
  { name: 'Travel', handle: 'travel' },
  { name: 'Cooking', handle: 'cooking' },
  { name: "Children's", handle: 'childrens' },
  { name: 'Young Adult', handle: 'young-adult' },
  { name: 'Comics & Graphic Novels', handle: 'comics-graphic-novels' },
  { name: 'Poetry', handle: 'poetry' },
  { name: 'Drama', handle: 'drama' },
  { name: 'Science', handle: 'science' },
  { name: 'Philosophy', handle: 'philosophy' },
  { name: 'Religion', handle: 'religion' },
  { name: 'Language Learning', handle: 'language-learning' },
];

/** Catalogue categories that books carry but the wireframe sidebar doesn't list */
const otherCategories: SidebarCategory[] = [
  { name: 'Fiction', handle: 'fiction' },
  { name: 'Non-fiction', handle: 'non-fiction' },
  { name: 'Thriller', handle: 'thriller' },
  { name: 'Horror', handle: 'horror' },
];

/** Display name for any category handle a book or URL can link to, or undefined if unknown */
export function categoryName(handle: string): string | undefined {
  return [...categories, ...otherCategories].find((category) => category.handle === handle)?.name;
}
