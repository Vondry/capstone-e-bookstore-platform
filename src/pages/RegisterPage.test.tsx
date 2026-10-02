import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loginAsDemo, renderWithProviders } from '@/test/render';
import { RegisterPage } from './RegisterPage';

function renderRegister(route = '/register?redirect=%2Fcheckout') {
  return renderWithProviders(<RegisterPage />, {
    route,
    path: '/register',
    extraRoutes: { '/checkout': <p>Checkout page</p>, '/': <p>Home page</p> },
  });
}

async function fillForm(
  overrides: Partial<Record<'First name' | 'Last name' | 'E-mail' | 'Password', string>> = {}
) {
  const values = {
    'First name': 'Ravi',
    'Last name': 'Kumar',
    'E-mail': 'ravi@example.com',
    Password: 'longenough',
    ...overrides,
  };
  const user = userEvent.setup();
  for (const [label, value] of Object.entries(values)) {
    await user.type(screen.getByLabelText(label), value);
  }
  return user;
}

describe('RegisterPage', () => {
  it('renders the form with autocomplete hints and title', () => {
    renderRegister();
    expect(screen.getByRole('heading', { level: 1, name: 'Create account' })).toBeInTheDocument();
    expect(document.title).toBe('Create account · Book Worm');
    expect(screen.getByLabelText('First name')).toHaveAttribute('autocomplete', 'given-name');
    expect(screen.getByLabelText('Last name')).toHaveAttribute('autocomplete', 'family-name');
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
  });

  it('shows the password rule as helper text', () => {
    renderRegister();
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('At least 8 characters');
  });

  it('flags a short password on blur', async () => {
    renderRegister();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.tab();
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'Use at least 8 characters'
    );
  });

  it('creates the account and redirects to the target', async () => {
    renderRegister();
    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Checkout page')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Welcome to Book Worm, Ravi');
  });

  it('shows an alert when the e-mail already exists', async () => {
    renderRegister();
    const user = await fillForm({ 'E-mail': 'reader@bookworm.test' });
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this e-mail already exists'
    );
    expect(screen.queryByText('Checkout page')).not.toBeInTheDocument();
  });

  it('links back to login keeping the redirect', () => {
    renderRegister();
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/login?redirect=%2Fcheckout'
    );
    expect(screen.getByRole('link', { name: 'Continue as guest' })).toHaveAttribute(
      'href',
      '/checkout'
    );
  });

  it('redirects a logged-in customer straight to the target', async () => {
    loginAsDemo();
    renderRegister();
    expect(await screen.findByText('Checkout page')).toBeInTheDocument();
  });
});
