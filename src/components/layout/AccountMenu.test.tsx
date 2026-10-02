import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AUTH_TOKEN_KEY } from '@/lib/medusa';
import { loginAsDemo, renderWithProviders } from '@/test/render';
import { AccountMenu } from './AccountMenu';

function renderMenu(route = '/orders') {
  return renderWithProviders(
    <div>
      <AccountMenu triggerClassName="h-48 w-48" />
      <p>Outside</p>
    </div>,
    { route, extraRoutes: { '/': <p>Home page</p> } }
  );
}

async function openMenu() {
  const user = userEvent.setup();
  const button = await screen.findByRole('button', { name: 'Profile' });
  await user.click(button);
  return { user, button };
}

describe('AccountMenu', () => {
  it('links guests to login with the current page as redirect', () => {
    renderMenu('/orders');
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'href',
      '/login?redirect=%2Forders'
    );
  });

  it('opens a menu with the customer name and focuses the first item', async () => {
    loginAsDemo();
    renderMenu();
    const { button } = await openMenu();

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Signed in as/)).toHaveTextContent('Signed in as Asha');
    expect(screen.getByRole('menu', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'My Orders' })).toHaveAttribute('href', '/orders');
    expect(screen.getByRole('menuitem', { name: 'My Orders' })).toHaveFocus();
  });

  it('moves between items with the arrow keys (wrapping), Home and End', async () => {
    loginAsDemo();
    renderMenu();
    const { user } = await openMenu();
    const orders = screen.getByRole('menuitem', { name: 'My Orders' });
    const logout = screen.getByRole('menuitem', { name: 'Log out' });

    await user.keyboard('{ArrowDown}');
    expect(logout).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(orders).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(logout).toHaveFocus();
    await user.keyboard('{Home}');
    expect(orders).toHaveFocus();
    await user.keyboard('{End}');
    expect(logout).toHaveFocus();
  });

  it('closes on Escape and returns focus to the button', async () => {
    loginAsDemo();
    renderMenu();
    const { user, button } = await openMenu();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('opens with ArrowDown on the button', async () => {
    loginAsDemo();
    renderMenu();
    const button = await screen.findByRole('button', { name: 'Profile' });
    button.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'My Orders' })).toHaveFocus();
  });

  it('closes on an outside click', async () => {
    loginAsDemo();
    renderMenu();
    const { user } = await openMenu();

    await user.click(screen.getByText('Outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('logs out, shows a toast and goes home', async () => {
    loginAsDemo();
    renderMenu();
    const { user } = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));

    expect(await screen.findByText('Home page')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent("You're logged out");
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it('shows the guest link again after logging out', async () => {
    loginAsDemo();
    // Mounted on every route, like the real header
    renderWithProviders(<AccountMenu triggerClassName="h-48 w-48" />, { route: '/orders' });
    const { user } = await openMenu();
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/login');
    });
  });
});
