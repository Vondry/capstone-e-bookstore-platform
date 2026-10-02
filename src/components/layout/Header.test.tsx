import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loginAsDemo, renderWithProviders } from '@/test/render';
import { Header } from './Header';

function renderHeader(props: Partial<React.ComponentProps<typeof Header>> = {}, route = '/') {
  const onMenuClick = vi.fn();
  renderWithProviders(
    <Header onMenuClick={onMenuClick} menuExpanded={false} cartCount={2} {...props} />,
    { route }
  );
  return { onMenuClick };
}

describe('Header', () => {
  it('renders the logo and main nav links', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'Book Worm' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'My Orders' })).toHaveAttribute('href', '/orders');
    expect(screen.getByRole('link', { name: 'My Wishlist' })).toHaveAttribute('href', '/wishlist');
    expect(screen.getByRole('link', { name: 'My Writers' })).toHaveAttribute('href', '/writers');
  });

  it('calls onMenuClick when the menu button is clicked', async () => {
    const { onMenuClick } = renderHeader();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(onMenuClick).toHaveBeenCalledOnce();
  });

  it('reflects the menu state with aria-expanded', () => {
    renderHeader({ menuExpanded: true });
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the cart count badge and an accessible cart label', () => {
    renderHeader({ cartCount: 2 });
    const cart = screen.getByRole('link', { name: 'Shopping cart, 2 items' });
    expect(cart).toHaveAttribute('href', '/checkout');
    expect(cart).toHaveTextContent('2');
  });

  it('hides the badge when the cart is empty', () => {
    renderHeader({ cartCount: 0 });
    expect(screen.getByRole('link', { name: 'Shopping cart, 0 items' })).toHaveTextContent('');
  });

  it('links the profile icon to login for guests', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/login');
  });

  it('includes the current page as the login redirect for guests', () => {
    renderHeader({}, '/books/godaan?tab=reviews');
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'href',
      '/login?redirect=%2Fbooks%2Fgodaan%3Ftab%3Dreviews'
    );
  });

  it('turns the profile icon into an account menu when logged in', async () => {
    loginAsDemo();
    renderHeader();
    const button = await screen.findByRole('button', { name: 'Profile' });
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(screen.queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument();
  });
});
