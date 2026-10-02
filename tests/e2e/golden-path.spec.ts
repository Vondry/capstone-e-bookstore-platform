/**
 * Golden path (deck journeys 1–12): browse → product → basket → address → payment → confirmation.
 * Runs on every project (desktop, mobile, tablet).
 */

import { expect, test } from '@playwright/test';
import {
  SUCCESS_HEADING,
  books,
  cartLink,
  continueToPayment,
  expectCartCount,
  fillAddress,
  fillCard,
  login,
  payAndConfirm,
} from './support/app';

test('a guest buys a book from the catalogue', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bestsellers this Month' })).toBeVisible();

  // Journey 7: select the product (it shows a delivery date)
  await page.getByRole('link', { name: books.midnightHour.title, exact: true }).first().click();
  await expect(page).toHaveURL(`/books/${books.midnightHour.handle}`);
  // first(): the Related Reads cards below also show delivery dates once they load
  await expect(page.getByText(/^Delivery by/).first()).toBeVisible();

  // Journey 8: add to basket
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByText(`“${books.midnightHour.title}” added to your cart`)).toBeVisible();
  await expectCartCount(page, 1);

  // Journey 9: delivery address
  await cartLink(page).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Shopping Cart' })).toBeVisible();
  await fillAddress(page);

  // Journeys 10–11: pay by card
  await continueToPayment(page);
  await expect(page.getByText('Payable Amount: ₹374.88')).toBeVisible();
  await fillCard(page);
  const orderNumber = await payAndConfirm(page);

  // Journey 12: purchase confirmation
  // #1003 on a fresh seed (#1001 and #1002 are the demo customer's); live databases keep counting
  expect(Number(orderNumber.replace('Order #', ''))).toBeGreaterThanOrEqual(1003);
  await expect(page.getByRole('list', { name: 'Purchased books' })).toContainText(
    books.midnightHour.title
  );
  await expectCartCount(page, 0);
  await page.getByRole('link', { name: 'Continue your Shopping' }).click();
  await expect(page).toHaveURL('/');
});

test('a member checks out with the saved address and gift points, then sees the order', async ({
  page,
}) => {
  // Journeys 1–2: login and authentication
  await login(page);

  await page.goto(`/books/${books.pathToSuccess.handle}`);
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expectCartCount(page, 1);
  await cartLink(page).click();

  await page.getByRole('checkbox', { name: 'Use Saved Address' }).check();
  await expect(page.getByLabel('First Name')).toHaveValue('Asha');

  // Journey 10: redeem gift points (120 available, at most 50 % of ₹359)
  const grandTotal = page.getByRole('complementary', { name: 'Grand Total' });
  await grandTotal.getByRole('switch', { name: 'Redeem gift points' }).click();
  await expect(grandTotal.getByText('Gift points', { exact: true })).toBeVisible();

  await continueToPayment(page);
  await page.getByRole('tab', { name: 'UPI' }).click();
  await page.getByLabel('UPI ID').fill('asha@okbank');
  const orderNumber = await payAndConfirm(page);
  await expect(page.getByText(/^You earned \d+ gift points?$/)).toBeVisible();

  await page.goto('/orders');
  await expect(page.getByRole('heading', { level: 2, name: orderNumber })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: SUCCESS_HEADING })).toHaveCount(0);
});
