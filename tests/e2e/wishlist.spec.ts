/**
 * My Wishlist (SIMULATED: stored in the browser, open to guests)
 */

import { expect, test } from '@playwright/test';
import { books, expectCartCount } from './support/app';

test('saves a book, moves it to the cart and removes it', async ({ page }) => {
  await page.goto('/wishlist');
  await expect(page.getByText('Your wishlist is empty')).toBeVisible();

  await page.goto(`/books/${books.artOfFocus.handle}`);
  const wishlistButton = page.getByRole('button', { name: 'Add to Wishlist' });
  await wishlistButton.click();
  await expect(page.getByText(`“${books.artOfFocus.title}” saved to your wishlist`)).toBeVisible();
  await expect(wishlistButton).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/wishlist');
  await expect(page.getByText('1 book saved')).toBeVisible();
  await page.getByRole('button', { name: `Add ${books.artOfFocus.title} to cart` }).click();
  await expect(page.getByText(`“${books.artOfFocus.title}” added to your cart`)).toBeVisible();
  await expectCartCount(page, 1);

  await page
    .getByRole('button', { name: `Remove ${books.artOfFocus.title} from wishlist` })
    .click();
  await expect(page.getByText('Your wishlist is empty')).toBeVisible();
});

test('the wishlist button toggles', async ({ page }) => {
  await page.goto(`/books/${books.artOfFocus.handle}`);
  const wishlistButton = page.getByRole('button', { name: 'Add to Wishlist' });
  await wishlistButton.click();
  await wishlistButton.click();

  await expect(
    page.getByText(`“${books.artOfFocus.title}” removed from your wishlist`)
  ).toBeVisible();
  await expect(wishlistButton).toHaveAttribute('aria-pressed', 'false');
});
