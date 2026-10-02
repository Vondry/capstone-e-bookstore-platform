/**
 * Responsive layout (.bob/rules/05-testing.md): runs on the mobile (375), tablet (768) and
 * desktop (1440) projects. Below lg (1056 px) the category sidebar lives in the Menu drawer;
 * below md (672 px) the main navigation does too.
 */

import { expect, test } from '@playwright/test';
import {
  addToCart,
  books,
  cartLink,
  continueToPayment,
  expectNoHorizontalScroll,
  fillAddress,
} from './support/app';

const LG = 1056;
const MD = 672;

function viewportWidth(page: import('@playwright/test').Page): number {
  return page.viewportSize()?.width ?? 0;
}

test('the Menu button matches the layout of the viewport', async ({ page }) => {
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  const sidebar = page
    .getByRole('main')
    .locator('..')
    .getByRole('navigation', { name: 'Categories' });

  if (viewportWidth(page) >= LG) {
    // Desktop: the sidebar is visible and the Menu button hides it
    await expect(sidebar).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await menu.click();
    await expect(sidebar).toBeHidden();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    return;
  }

  // Mobile and tablet: the sidebar is hidden and the Menu button opens a drawer
  await expect(sidebar).toBeHidden();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  const drawer = page.getByRole('dialog', { name: 'Menu' });
  await expect(drawer).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');

  await drawer.getByRole('link', { name: 'Romance', exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL('/category/romance');
});

test('the main navigation is in the header from md and in the drawer below', async ({ page }) => {
  await page.goto('/');
  const headerNav = page.getByRole('banner').getByRole('navigation', { name: 'Main' });

  if (viewportWidth(page) >= MD) {
    await expect(headerNav).toBeVisible();
    await headerNav.getByRole('link', { name: 'My Wishlist' }).click();
  } else {
    await expect(headerNav).toBeHidden();
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page
      .getByRole('dialog', { name: 'Menu' })
      .getByRole('link', { name: 'My Wishlist' })
      .click();
  }
  await expect(page).toHaveURL('/wishlist');
});

test('no screen scrolls sideways', async ({ page }) => {
  for (const path of [
    '/',
    '/category/mystery',
    `/books/${books.artOfFocus.handle}`,
    '/writers',
    '/orders',
    '/login',
  ]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  }

  await addToCart(page, books.joyOfMinimalism);
  await cartLink(page).click();
  await expect(page.getByRole('complementary', { name: 'Grand Total' })).toBeVisible();
  await expectNoHorizontalScroll(page);

  await fillAddress(page);
  await continueToPayment(page);
  await expectNoHorizontalScroll(page);
});

test('below lg a category is picked from the Menu drawer', async ({ page }) => {
  // Desktop has no drawer for categories: the sidebar is always visible from lg
  test.skip(viewportWidth(page) >= LG, 'the sidebar is always visible from lg');
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Menu' });
  await drawer.getByRole('link', { name: 'Poetry', exact: true }).click();

  await expect(page).toHaveURL('/category/poetry');
  await expect(drawer).toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: 'Poetry' })).toBeVisible();
});
