/**
 * Shared E2E data and user steps. Everything here mirrors what the app really renders:
 * seed data from src/mocks (MSW runs in the dev server) and labels from the components.
 * Each Playwright test gets a fresh browser context, so the mock DB starts from its seed.
 */

import { expect, type Page } from '@playwright/test';

/** Seeded demo customer (src/mocks/db.ts): 120 gift points, orders #1002 (2 h old) and #1001 (10 days old) */
export const demoUser = {
  email: 'reader@bookworm.test',
  password: 'bookworm123',
  firstName: 'Asha',
} as const;

/** Books from src/mocks/data/books.ts */
export const books = {
  midnightHour: { handle: 'the-midnight-hour', title: 'The Midnight Hour', price: 299 },
  joyOfMinimalism: { handle: 'joy-of-minimalism', title: 'Joy of Minimalism', price: 149 },
  pathToSuccess: { handle: 'the-path-to-success', title: 'The Path to Success', price: 359 },
  artOfFocus: { handle: 'the-art-of-focus', title: 'The Art of Focus', price: 399 },
  vanishingHouse: { handle: 'the-vanishing-house', title: 'The Vanishing House', price: 99 },
  godaan: { handle: 'godaan', title: 'Godaan', price: 199 },
} as const;

/** A new e-mail per call, so sign-up tests also pass against a live database that keeps its customers */
export function uniqueEmail(name: string): string {
  return `${name}+${String(Date.now())}${String(Math.floor(Math.random() * 1000))}@example.com`;
}

export const address = {
  firstName: 'Ravi',
  lastName: 'Kumar',
  address: '4 Park Street',
  email: 'ravi@example.com',
  city: 'Kolkata',
  pin: '700016',
  phone: '9876543210',
  state: 'West Bengal',
} as const;

/** Luhn-valid test cards (src/features/payment/lib/simulateOutcome.ts) */
export const cards = {
  valid: '4111111111111111',
  declined: '4000000000000002',
} as const;

export const SUCCESS_HEADING = 'Your purchase of the following reads is successful';

export function cartLink(page: Page) {
  return page.getByRole('link', { name: /^Shopping cart, \d+ items?$/ });
}

export async function expectCartCount(page: Page, count: number) {
  await expect(
    page.getByRole('link', {
      name: `Shopping cart, ${String(count)} ${count === 1 ? 'item' : 'items'}`,
    })
  ).toBeVisible();
}

export async function login(page: Page, redirect?: string) {
  await page.goto(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login');
  await page.getByLabel('E-mail').fill(demoUser.email);
  // exact: the "Show password" toggle also mentions the password
  await page.getByLabel('Password', { exact: true }).fill(demoUser.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText(`Welcome back, ${demoUser.firstName}`)).toBeVisible();
}

/** Opens the product page and adds one copy to the cart */
export async function addToCart(page: Page, book: { handle: string; title: string }) {
  await page.goto(`/books/${book.handle}`);
  await expect(page.getByRole('heading', { level: 1, name: book.title })).toBeVisible();
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByText(`“${book.title}” added to your cart`)).toBeVisible();
}

export async function fillAddress(page: Page) {
  const form = page.getByRole('form', { name: 'Delivery address' });
  await form.getByLabel('First Name').fill(address.firstName);
  await form.getByLabel('Last Name').fill(address.lastName);
  await form.getByLabel('Address', { exact: true }).fill(address.address);
  await form.getByLabel('e-mail').fill(address.email);
  await form.getByLabel('City').fill(address.city);
  await form.getByRole('textbox', { name: 'Pin' }).fill(address.pin);
  await form.getByLabel('Phone Number').fill(address.phone);
  await form.getByLabel('State').fill(address.state);
}

/** From a filled checkout: Pay Now saves the address and opens the payment screen */
export async function continueToPayment(page: Page) {
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await expect(page).toHaveURL(/\/payment$/);
  await expect(page.getByRole('heading', { name: 'Complete Payment' })).toBeVisible();
}

export async function fillCard(page: Page, cardNumber: string = cards.valid) {
  await page.getByLabel('Card Number').fill(cardNumber);
  await page.getByLabel('Name on Card').fill('Ravi Kumar');
  await page.getByLabel('CVV').fill('123');
  await page.getByLabel('Date of Expiry').fill('122030');
}

/** Payment screen → success screen; returns the order number shown */
export async function payAndConfirm(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await expect(page).toHaveURL(/\/orders\/[^/]+\/success$/);
  await expect(page.getByRole('heading', { level: 1, name: SUCCESS_HEADING })).toBeFocused();
  const orderNumber = await page.getByText(/^Order #\d+$/).textContent();
  return orderNumber ?? '';
}

/** The page must never scroll sideways (responsive check) */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
}
