/**
 * S5 Payment and S6 Purchase success (deck journeys 10 payment option, 11 payment confirmation,
 * 12 purchase confirmation)
 */

import { expect, test, type Page } from '@playwright/test';
import {
  SUCCESS_HEADING,
  addToCart,
  books,
  cards,
  cartLink,
  continueToPayment,
  fillAddress,
  fillCard,
  payAndConfirm,
} from './support/app';

async function openPayment(page: Page) {
  await addToCart(page, books.midnightHour);
  await cartLink(page).click();
  await fillAddress(page);
  await continueToPayment(page);
}

test('Pay Now stays disabled until the card form is valid', async ({ page }) => {
  await openPayment(page);
  const payNow = page.getByRole('button', { name: 'Pay Now' });
  await expect(payNow).toBeDisabled();

  await page.getByLabel('Card Number').fill('4111111111111112');
  await page.getByLabel('Name on Card').focus();
  await expect(page.getByText('Enter a valid card number')).toBeVisible();
  await expect(payNow).toBeDisabled();

  await fillCard(page);
  await expect(page.getByLabel('Card Number')).toHaveValue('4111-1111-1111-1111');
  await expect(page.getByLabel('Date of Expiry')).toHaveValue('12/2030');
  await expect(payNow).toBeEnabled();
});

test('a declined card shows an error, keeps the form and clears the CVV', async ({ page }) => {
  await openPayment(page);
  await fillCard(page, cards.declined);
  await page.getByRole('button', { name: 'Pay Now' }).click();

  await expect(
    page.getByText('Your card was declined. Try another card or payment method.')
  ).toBeVisible();
  await expect(page).toHaveURL('/payment');
  await expect(page.getByLabel('Name on Card')).toHaveValue('Ravi Kumar');
  await expect(page.getByLabel('CVV')).toHaveValue('');

  // Retry with a good card
  await page.getByLabel('Card Number').fill(cards.valid);
  await page.getByLabel('CVV').fill('123');
  await payAndConfirm(page);
});

test('pays with a debit card', async ({ page }) => {
  await openPayment(page);
  await page.getByRole('tab', { name: 'Debit card' }).click();
  await fillCard(page);
  await payAndConfirm(page);
});

test('pays with a wallet and shows the confirmation', async ({ page }) => {
  await openPayment(page);
  await page.getByRole('tab', { name: 'Wallet' }).click();
  await page.getByRole('combobox', { name: 'Wallet' }).selectOption('paytm');
  const orderNumber = await payAndConfirm(page);

  expect(orderNumber).toMatch(/^Order #\d+$/);
  await expect(page).toHaveTitle('Order confirmed · Book Worm');
  await expect(page.getByRole('list', { name: 'Purchased books' })).toContainText(
    books.midnightHour.title
  );
  // Guests are not told they earned points they can't collect
  await expect(page.getByText(/^This order would have earned \d+ gift points?\./)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: SUCCESS_HEADING })).toBeVisible();
});

test('asks for an address before payment', async ({ page }) => {
  await addToCart(page, books.midnightHour);
  await page.goto('/payment');
  await expect(page.getByText('Add a delivery address first')).toBeVisible();
  await page.getByRole('link', { name: 'Back to checkout' }).click();
  await expect(page).toHaveURL('/checkout');
});
