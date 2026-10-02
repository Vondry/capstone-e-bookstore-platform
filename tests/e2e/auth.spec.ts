/**
 * S1 Login / Register (deck journeys 1–2)
 */

import { expect, test } from '@playwright/test';
import { demoUser, login, uniqueEmail } from './support/app';

test('logs in and returns to the page the user came from', async ({ page }) => {
  await page.goto('/orders');
  await page.getByRole('link', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)orders$/);

  await page.getByLabel('E-mail').fill(demoUser.email);
  await page.getByLabel('Password', { exact: true }).fill(demoUser.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/orders');
  await expect(page.getByRole('heading', { level: 2, name: 'Order #1002' })).toBeVisible();
});

test('shows an inline error for a wrong password', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(demoUser.email);
  await page.getByLabel('Password', { exact: true }).fill('not-the-password');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByText('Incorrect e-mail or password. Please try again.')).toBeVisible();
  await expect(page).toHaveURL('/login');
});

test('validates the login form before submitting', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByText('Enter your e-mail address')).toBeVisible();
  await expect(page.getByText('Enter your password')).toBeVisible();
});

test('shows and hides the password', async ({ page }) => {
  await page.goto('/login');
  const password = page.getByLabel('Password', { exact: true });
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Show password' }).click();
  await expect(password).toHaveAttribute('type', 'text');
});

test('registers a new account and is signed in', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('First name').fill('Meera');
  await page.getByLabel('Last name').fill('Iyer');
  await page.getByLabel('E-mail').fill(uniqueEmail('meera'));
  await page.getByLabel('Password', { exact: true }).fill('readingrocks');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page.getByText('Welcome to Book Worm, Meera')).toBeVisible();
  await page.getByRole('button', { name: 'Profile' }).click();
  await expect(page.getByText('Signed in as Meera')).toBeVisible();
});

test('rejects registering an e-mail that already has an account', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('First name').fill('Asha');
  await page.getByLabel('Last name').fill('Verma');
  await page.getByLabel('E-mail').fill(demoUser.email);
  await page.getByLabel('Password', { exact: true }).fill('anotherpass');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(
    page.getByText('An account with this e-mail already exists. Log in instead.')
  ).toBeVisible();
});

test('a guest can skip login', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('link', { name: 'Continue as guest' }).click();
  await expect(page).toHaveURL('/');
});

test('logs out from the profile menu', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Profile' }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();

  await expect(page.getByText("You're logged out")).toBeVisible();
  await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
});
