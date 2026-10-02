/**
 * S4 Shopping cart + checkout (deck journeys 8 basket, 9 delivery address, coupon, gift points)
 */

import { expect, test, type Page } from '@playwright/test';
import {
  addToCart,
  books,
  cartLink,
  continueToPayment,
  expectCartCount,
  fillAddress,
  login,
  payAndConfirm,
} from './support/app';

const grandTotal = (page: Page) => page.getByRole('complementary', { name: 'Grand Total' });

/** The wireframe cart: Joy of Minimalism ₹149 + The Path to Success ₹359 = ₹508 */
async function seedWireframeCart(page: Page) {
  await addToCart(page, books.joyOfMinimalism);
  await addToCart(page, books.pathToSuccess);
  await cartLink(page).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Shopping Cart' })).toBeVisible();
}

test('shows an empty cart with a way back to the catalogue', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page.getByText('Your cart is empty')).toBeVisible();
  await page.getByRole('link', { name: /catalogue/i }).click();
  await expect(page).toHaveURL('/');
});

test('changes quantities and updates the totals', async ({ page }) => {
  await seedWireframeCart(page);
  await expect(grandTotal(page).getByText('Price (2 items)')).toBeVisible();
  // ₹508 is over the free-delivery threshold
  await expect(grandTotal(page).getByText('Free')).toBeVisible();

  await page
    .getByRole('button', { name: `Increase quantity of ${books.joyOfMinimalism.title}` })
    .click();
  await expect(grandTotal(page).getByText('Price (3 items)')).toBeVisible();
  await expectCartCount(page, 3);
});

test('asks before removing the last copy of a book', async ({ page }) => {
  await seedWireframeCart(page);
  const decrease = page.getByRole('button', {
    name: `Decrease quantity of ${books.joyOfMinimalism.title}`,
  });

  await decrease.click();
  const dialog = page.getByRole('alertdialog', {
    name: `Remove ${books.joyOfMinimalism.title} from your cart?`,
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();
  await expect(grandTotal(page).getByText('Price (2 items)')).toBeVisible();

  await decrease.click();
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.getByRole('link', { name: books.joyOfMinimalism.title })).toHaveCount(0);
  await expect(grandTotal(page).getByText('Price (1 item)')).toBeVisible();
});

test('charges ₹40 delivery below ₹499', async ({ page }) => {
  // ₹149 paperback: under the free-delivery threshold
  await addToCart(page, books.joyOfMinimalism);
  await cartLink(page).click();
  await expect(grandTotal(page).getByText('₹40.00')).toBeVisible();
});

test('charges no delivery for an eBook-only cart', async ({ page }) => {
  await addToCart(page, books.vanishingHouse);
  await cartLink(page).click();
  await expect(grandTotal(page).getByText('Price (1 item)')).toBeVisible();
  await expect(grandTotal(page).getByText('Free')).toBeVisible();
});

test('drops the delivery charge when the last physical book is replaced by an eBook', async ({
  page,
}) => {
  // Medusa keeps the paperback's shipping method; the storefront removes it
  // (DELETE /store/carts/:id/shipping-methods)
  await addToCart(page, books.joyOfMinimalism);
  await cartLink(page).click();
  await expect(grandTotal(page).getByText('₹40.00')).toBeVisible();
  await page
    .getByRole('button', { name: `Decrease quantity of ${books.joyOfMinimalism.title}` })
    .click();
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.getByText('Your cart is empty')).toBeVisible();

  await addToCart(page, books.vanishingHouse);
  await cartLink(page).click();
  await expect(grandTotal(page).getByText('Price (1 item)')).toBeVisible();
  await expect(grandTotal(page).getByText('Free')).toBeVisible();
});

test('applies and removes a coupon', async ({ page }) => {
  await seedWireframeCart(page);
  const panel = grandTotal(page);

  await panel.getByLabel('Coupon code', { exact: true }).fill('bookworm100');
  await panel.getByRole('button', { name: 'Apply' }).click();
  await expect(panel.getByText(/Coupon BOOKWORM100\s+applied/)).toBeVisible();
  await expect(panel.getByText('−₹100.00')).toBeVisible();

  await panel.getByRole('button', { name: 'Remove coupon BOOKWORM100' }).click();
  await expect(panel.getByLabel('Coupon code', { exact: true })).toBeVisible();
});

test('rejects an unknown coupon', async ({ page }) => {
  await seedWireframeCart(page);
  const panel = grandTotal(page);
  await panel.getByLabel('Coupon code', { exact: true }).fill('NOPE');
  await panel.getByRole('button', { name: 'Apply' }).click();
  await expect(panel.getByText('This coupon code is not valid')).toBeVisible();
});

test('validates the delivery address before going to payment', async ({ page }) => {
  await seedWireframeCart(page);
  await page.getByRole('button', { name: 'Pay Now' }).click();

  await expect(page.getByText('Enter your first name')).toBeVisible();
  await expect(page).toHaveURL('/checkout');

  await fillAddress(page);
  await page.getByRole('textbox', { name: 'Pin' }).fill('123');
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await expect(page.getByText('Pin must be 6 digits')).toBeVisible();
  await expect(page).toHaveURL('/checkout');
});

test('guests are asked to log in to redeem gift points and come back', async ({ page }) => {
  await seedWireframeCart(page);
  await grandTotal(page).getByRole('link', { name: 'Log in' }).click();
  await expect(page).toHaveURL('/login?redirect=%2Fcheckout');
});

test("a guest's cart moves to their account when they log in at checkout", async ({ page }) => {
  await seedWireframeCart(page);
  await login(page, '/checkout');
  await expect(page).toHaveURL('/checkout');
  await expect(grandTotal(page).getByText('Price (2 items)')).toBeVisible();

  // Only the customer's own cart can use their points (Medusa: cart.customer_id)
  await page.getByRole('checkbox', { name: 'Use Saved Address' }).check();
  await grandTotal(page).getByRole('switch', { name: 'Redeem gift points' }).click();
  await expect(grandTotal(page).getByText('Gift points', { exact: true })).toBeVisible();

  await continueToPayment(page);
  await page.getByRole('tab', { name: 'UPI' }).click();
  await page.getByLabel('UPI ID').fill('asha@okbank');
  const orderNumber = await payAndConfirm(page);

  // …and the order is in their history
  await page.goto('/orders');
  await expect(page.getByRole('heading', { level: 2, name: orderNumber })).toBeVisible();
});

test('members can use their saved address', async ({ page }) => {
  await login(page);
  await seedWireframeCart(page);

  await page.getByRole('checkbox', { name: 'Use Saved Address' }).check();
  await expect(page.getByLabel('First Name')).toHaveValue('Asha');
  // 120 in the seed; a live database keeps the balance of earlier runs
  await expect(grandTotal(page).getByText(/^Available: \d+ points$/)).toBeVisible();
});
