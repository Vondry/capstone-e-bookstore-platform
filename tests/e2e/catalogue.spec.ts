/**
 * S2 Home / Catalogue, S3 Product detail and S8 brands
 * (deck journeys 3 categories, 5 select category, 6 brands, 7 product + related products)
 */

import { expect, test } from '@playwright/test';
import { books } from './support/app';

test.describe('home and categories', () => {
  test('shows the bestseller and new launch sections with delivery dates', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Home · Book Worm');
    await expect(page.getByRole('heading', { name: 'Bestsellers this Month' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New Launches' })).toBeVisible();
    // Physical books get a date, eBooks are instant
    await expect(page.getByText(/^Delivery by/).first()).toBeVisible();
    await expect(page.getByText('Delivery: Instant').first()).toBeVisible();
  });

  test('selects a category from the sidebar', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Categories' })
      .getByRole('link', { name: 'Mystery', exact: true })
      .click();

    await expect(page).toHaveURL('/category/mystery');
    await expect(page.getByRole('heading', { level: 1, name: 'Mystery' })).toBeVisible();
    await expect(page).toHaveTitle('Mystery · Book Worm');
    await expect(page.getByText(/^Showing \d+ books?$/)).toBeVisible();
  });

  test('opens a category that is not in the sidebar from a book', async ({ page }) => {
    await page.goto(`/books/${books.midnightHour.handle}`);
    await page.getByRole('link', { name: 'Fiction', exact: true }).first().click();

    await expect(page).toHaveURL('/category/fiction');
    await expect(page.getByRole('heading', { level: 1, name: 'Fiction' })).toBeVisible();
  });
});

test.describe('filters and search', () => {
  test('filters by format and keeps the filter in the URL', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Format (Paperback, ebook etc)').selectOption('ebook');

    await expect(page).toHaveURL(/format=ebook/);
    await expect(page.getByRole('heading', { level: 1, name: 'Search Results' })).toBeVisible();
    // Retrying assertions: the previous results stay on screen while the filtered ones load
    const cards = page.getByRole('main').getByRole('article');
    await expect(cards.first()).toBeVisible();
    await expect(cards.filter({ hasNot: page.getByText('eBook', { exact: true }) })).toHaveCount(0);

    await page.reload();
    await expect(page.getByLabel('Format (Paperback, ebook etc)')).toHaveValue('ebook');
  });

  test('searches by title and clears the filters', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Search you want to read here').fill(books.godaan.title);

    await expect(page).toHaveURL(/search=Godaan/);
    await expect(page.getByText('Showing 1 book')).toBeVisible();
    await expect(page.getByRole('link', { name: books.godaan.title, exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Clear all filters' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Bestsellers this Month' })).toBeVisible();
  });

  test('combines a price range with a price sort', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Price Range').selectOption('200-400');
    await page.getByLabel('Sort by').selectOption('price-asc');

    await expect(page).toHaveURL(/priceMin=200/);
    await expect(page).toHaveURL(/sortBy=price-asc/);
    const prices = page
      .getByRole('main')
      .getByRole('article')
      .getByText(/^₹\d+$/);
    // The 12 books priced ₹200–₹400 in the seed, cheapest first. Polls: the unsorted results
    // stay on screen until the sorted ones arrive.
    await expect
      .poll(async () => (await prices.allTextContents()).map((price) => Number(price.slice(1))))
      .toEqual([249, 259, 279, 299, 299, 319, 339, 349, 359, 359, 389, 399]);
    await expect(page.getByText('Showing 12 books')).toBeVisible();

    await page.getByLabel('Sort by').selectOption('price-desc');
    await expect(prices.first()).toHaveText('₹399');
  });

  test('filters by language from the product page', async ({ page }) => {
    await page.goto(`/books/${books.godaan.handle}`);
    await page.getByRole('link', { name: 'Hindi', exact: true }).click();

    await expect(page).toHaveURL('/?language=hindi');
    await expect(page.getByLabel('Language')).toHaveValue('hindi');
    await expect(page.getByText('Showing 2 books')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Madhushala', exact: true })).toBeVisible();
  });

  test('shows an empty state when nothing matches', async ({ page }) => {
    await page.goto('/?search=zzzz-no-such-book');
    await expect(page.getByText('No books match your filters')).toBeVisible();
  });
});

test.describe('product detail', () => {
  test('shows the book, delivery estimate, writer and related reads', async ({ page }) => {
    await page.goto(`/books/${books.artOfFocus.handle}`);

    await expect(
      page.getByRole('heading', { level: 1, name: books.artOfFocus.title })
    ).toBeVisible();
    await expect(page).toHaveTitle(`${books.artOfFocus.title} · Book Worm`);
    await expect(page.getByText('₹399', { exact: true })).toBeVisible();
    await expect(page.getByText(/^Delivery by/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'About the writer' })).toBeVisible();

    const related = page.getByRole('complementary', { name: 'Related Reads' });
    await expect(related.getByRole('heading', { level: 3 })).toHaveCount(3);
    await expect(related).not.toContainText(books.artOfFocus.title);

    await related.getByRole('heading', { level: 3 }).first().getByRole('link').click();
    await expect(page).toHaveURL(/\/books\//);
    await expect(page).not.toHaveURL(`/books/${books.artOfFocus.handle}`);
  });

  test('adds a review with a rating', async ({ page }) => {
    await page.goto(`/books/${books.artOfFocus.handle}`);
    await page.getByLabel('Leave Your Review').fill('Clear, practical and short.');
    await expect(page.getByText('27/100')).toBeVisible();
    // The radios are visually hidden; users click the star icon, which is the radio's label
    const fiveStars = page.getByRole('radio', { name: '5 stars' });
    await page.locator('label', { has: fiveStars }).click();
    await expect(fiveStars).toBeChecked();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Thanks! Your review has been added.')).toBeVisible();
    await expect(page.getByText('Clear, practical and short.')).toBeVisible();
  });

  test('goes back to the top category from the breadcrumb', async ({ page }) => {
    await page.goto(`/books/${books.joyOfMinimalism.handle}`);
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toContainText('Self Help');
    await breadcrumb.getByRole('link', { name: 'Non-Fiction' }).click();

    await expect(page).toHaveURL('/category/non-fiction');
    await expect(page.getByRole('heading', { level: 1, name: 'Non-fiction' })).toBeVisible();
  });

  test('shows a not-found page for an unknown book', async ({ page }) => {
    await page.goto('/books/no-such-book');
    await expect(page.getByText('Book not found')).toBeVisible();
    await page.getByRole('link', { name: 'Browse the catalogue' }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('brands', () => {
  test('browses writers and a writer page', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'My Writers' })
      .click();
    await expect(page.getByRole('heading', { level: 1, name: 'My Writers' })).toBeVisible();

    const allWriters = page.getByRole('region', { name: 'All writers' });
    const firstWriter = allWriters.getByRole('link').first();
    const writerName = (await firstWriter.innerText()).split('\n')[0] ?? '';
    await firstWriter.click();

    await expect(page).toHaveURL(/\/writers\/[^/]+$/);
    await expect(page.getByRole('heading', { level: 1, name: writerName })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: `Books by ${writerName}` })
    ).toBeVisible();
  });

  test('opens a publisher from the product page', async ({ page }) => {
    await page.goto(`/books/${books.artOfFocus.handle}`);
    await page.getByRole('link', { name: 'Penguin India' }).click();

    await expect(page).toHaveURL('/publishers/penguin-india');
    await expect(page.getByRole('heading', { level: 1, name: 'Penguin India' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: books.artOfFocus.title })
    ).toBeVisible();
  });

  test('lists publishers', async ({ page }) => {
    await page.goto('/writers');
    await page
      .getByRole('navigation', { name: 'Browse by' })
      .getByRole('link', { name: 'Publishers' })
      .click();
    await expect(page).toHaveURL('/publishers');
    await expect(page.getByRole('link', { name: /Penguin India/ })).toBeVisible();
  });
});

test('shows a not-found page for an unknown address', async ({ page }) => {
  await page.goto('/no-such-page');
  await expect(page).toHaveTitle('Page not found · Book Worm');
  await page.getByRole('link', { name: 'Back to the catalogue' }).click();
  await expect(page).toHaveURL('/');
});
