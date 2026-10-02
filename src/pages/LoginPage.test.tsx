import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { server } from '@/mocks/server';
import { loginAsDemo, renderWithProviders } from '@/test/render';
import { LoginPage } from './LoginPage';

function renderLogin(route = '/login?redirect=%2Forders%3Fx%3D1') {
  return renderWithProviders(<LoginPage />, {
    route,
    path: '/login',
    extraRoutes: {
      '/orders': <p>Orders page</p>,
      '/': <p>Home page</p>,
      '/register': <p>Register page</p>,
    },
  });
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Log in' }));
  return user;
}

describe('LoginPage', () => {
  it('renders the panel and sets the document title', () => {
    renderLogin();
    expect(screen.getByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Log in' })).toBeInTheDocument();
    expect(document.title).toBe('Log in · Book Worm');
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
  });

  it('shows the demo account hint in development', () => {
    renderLogin();
    expect(screen.getByText('Demo: reader@bookworm.test / bookworm123')).toBeInTheDocument();
  });

  it('logs in and redirects to the ?redirect target', async () => {
    renderLogin();
    await fillAndSubmit('reader@bookworm.test', 'bookworm123');
    expect(await screen.findByText('Orders page')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Welcome back, Asha');
  });

  it('redirects home when the redirect is unsafe', async () => {
    renderLogin('/login?redirect=%2F%2Fevil.com');
    await fillAndSubmit('reader@bookworm.test', 'bookworm123');
    expect(await screen.findByText('Home page')).toBeInTheDocument();
  });

  it('shows an alert for a wrong password and keeps the form', async () => {
    renderLogin();
    await fillAndSubmit('reader@bookworm.test', 'wrong-password');
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect e-mail or password');
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
    expect(screen.queryByText('Orders page')).not.toBeInTheDocument();
  });

  it('disables the button and shows loading while submitting', async () => {
    let release: () => void = () => undefined;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.post('*/auth/customer/emailpass', async () => {
        await pending;
        return HttpResponse.json({ message: 'Incorrect e-mail or password' }, { status: 401 });
      })
    );
    renderLogin();
    await fillAndSubmit('reader@bookworm.test', 'bookworm123');

    const button = await screen.findByRole('button', { name: 'Logging in…' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    release();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
  });

  it('validates on blur with inline errors linked to the field', async () => {
    const user = userEvent.setup();
    renderLogin();
    const email = screen.getByLabelText('E-mail');
    await user.type(email, 'reader@');
    expect(screen.queryByText(/valid e-mail/)).not.toBeInTheDocument();
    await user.tab();
    expect(email).toHaveAccessibleDescription(
      'Enter a valid e-mail address, e.g. name@example.com'
    );
    expect(email).toHaveAttribute('aria-invalid', 'true');
    // Re-validates on change after the first error
    await user.type(email, 'bookworm.test');
    expect(email).toHaveAttribute('aria-invalid', 'false');
  });

  it('shows required errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Enter your e-mail address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();
    const password = screen.getByLabelText('Password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
  });

  it('links to register and guest checkout, keeping the redirect', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/register?redirect=%2Forders%3Fx%3D1'
    );
    expect(screen.getByRole('link', { name: 'Continue as guest' })).toHaveAttribute(
      'href',
      '/orders?x=1'
    );
  });

  it('sends guests home when there is no redirect', () => {
    renderLogin('/login');
    expect(screen.getByRole('link', { name: 'Continue as guest' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/register'
    );
  });

  it('redirects a logged-in customer straight to the target', async () => {
    loginAsDemo();
    renderLogin();
    expect(await screen.findByText('Orders page')).toBeInTheDocument();
  });
});
