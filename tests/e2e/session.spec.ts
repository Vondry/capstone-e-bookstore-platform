/**
 * What survives a page reload: the theme choice, the login and the cart
 */

import { expect, test } from '@playwright/test';
import { addToCart, books, expectCartCount, login } from './support/app';

test('remembers the chosen theme after a reload', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  const next = before === 'dark' ? 'light' : 'dark';

  await page.getByRole('button', { name: `Switch to ${next} theme` }).click();
  await expect(html).toHaveAttribute('data-theme', next);

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', next);
});

test('keeps the login and the cart after a reload', async ({ page }) => {
  await login(page);
  await addToCart(page, books.godaan);
  await expectCartCount(page, 1);

  await page.reload();
  await expectCartCount(page, 1);
  await page.getByRole('button', { name: 'Profile' }).click();
  await expect(page.getByText(/^Signed in as /)).toBeVisible();
});
