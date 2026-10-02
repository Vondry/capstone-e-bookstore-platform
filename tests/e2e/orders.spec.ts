/**
 * S7 My Orders (deck: order history with Buy it again, cancel within 48 h,
 * recommendations based on order history)
 */

import { expect, test } from '@playwright/test';
import { books, cartLink, expectCartCount, login, uniqueEmail } from './support/app';

test('guests are asked to log in', async ({ page }) => {
  await page.goto('/orders');
  await expect(page.getByText('Log in to see your orders')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
});

test.describe('logged in', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, '/orders');
    await expect(page.getByRole('heading', { level: 1, name: 'My Orders' })).toBeVisible();
  });

  test('lists orders newest first with status, date and total', async ({ page }) => {
    const headings = page.getByRole('heading', { level: 2, name: /^Order #/ });
    await expect(headings.last()).toHaveText('Order #1001');
    // Newest first; a live database also lists orders placed by earlier runs
    const numbers = (await headings.allTextContents()).map((text) => Number(text.slice(7)));
    expect(numbers).toEqual([...numbers].sort((a, b) => b - a));
    expect(numbers).toContain(1002);

    const recent = page.getByRole('region', { name: 'Order #1002' });
    await expect(recent.getByText(/^Status:\s*Placed$/)).toBeVisible();
    await expect(recent.locator('time')).toBeVisible();
    await expect(
      recent.getByRole('heading', { level: 3, name: books.artOfFocus.title })
    ).toBeVisible();
  });

  test('buys a book again from an old order', async ({ page }) => {
    const older = page.getByRole('region', { name: 'Order #1001' });
    await older.getByRole('button', { name: 'Buy Letters from Monsoon again' }).click();

    await expect(page.getByText('Added Letters from Monsoon to your cart')).toBeVisible();
    await expectCartCount(page, 1);
    await cartLink(page).click();
    await expect(page.getByRole('link', { name: 'Letters from Monsoon' }).first()).toBeVisible();
  });

  test('cancels an order inside the 48 h window after confirming', async ({ page }) => {
    const recent = page.getByRole('region', { name: 'Order #1002' });
    await expect(recent.getByText(/^You can cancel for another \d+ h$/)).toBeVisible();

    await recent.getByRole('button', { name: 'Cancel order' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Cancel order #1002?' });
    await dialog.getByRole('button', { name: 'Keep order' }).click();
    await expect(dialog).toBeHidden();

    await recent.getByRole('button', { name: 'Cancel order' }).click();
    await dialog.getByRole('button', { name: 'Request cancellation' }).click();

    await expect(page.getByText('Cancellation requested for order #1002')).toBeVisible();
    await expect(recent.getByText(/^Status:\s*Cancellation requested$/)).toBeVisible();
    await expect(recent.getByRole('button', { name: 'Cancel order' })).toHaveCount(0);
  });

  test('orders older than 48 h can no longer be cancelled', async ({ page }) => {
    const older = page.getByRole('region', { name: 'Order #1001' });
    await expect(older.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(older.getByRole('button', { name: 'Cancel order' })).toHaveCount(0);
  });

  test('recommends books based on the order history', async ({ page }) => {
    await page.goto('/');
    const recommended = page.getByRole('heading', { level: 1, name: 'Recommended for You' });
    await expect(recommended).toBeVisible();
    // Already-bought books are not recommended again
    const section = page.locator('section', { has: recommended });
    await expect(section.getByRole('article').first()).toBeVisible();
    await expect(section).not.toContainText(books.artOfFocus.title);
  });
});

test('a new customer sees an empty order history', async ({ page }) => {
  await page.goto('/register?redirect=%2Forders');
  await page.getByLabel('First name').fill('Dev');
  await page.getByLabel('Last name').fill('Rao');
  await page.getByLabel('E-mail').fill(uniqueEmail('dev'));
  await page.getByLabel('Password', { exact: true }).fill('newreader1');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL('/orders');
  await expect(page.getByText('No orders yet')).toBeVisible();
});
