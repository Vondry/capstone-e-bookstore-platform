import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

function visit(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

describe('App routes', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders the catalogue at /', async () => {
    visit('/');
    expect(
      await screen.findByRole('heading', { name: 'Bestsellers this Month' })
    ).toBeInTheDocument();
  });

  it('lazy-loads a screen route', async () => {
    visit('/login');
    expect(await screen.findByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
  });

  // Every route lazy-loads its screen and renders without hitting the error boundary
  it.each([
    ['/category/poetry', 'Poetry · Book Worm'],
    ['/books/godaan', 'Godaan · Book Worm'],
    ['/checkout', 'Checkout · Book Worm'],
    ['/payment', 'Payment · Book Worm'],
    ['/orders', 'My Orders · Book Worm'],
    ['/orders/order_seed_1002/success', 'Order confirmed · Book Worm'],
    ['/register', 'Create account · Book Worm'],
    ['/wishlist', 'My Wishlist · Book Worm'],
    ['/writers', 'My Writers · Book Worm'],
    ['/writers/daniel-reed', 'Daniel Reed · Book Worm'],
    ['/publishers', 'Publishers · Book Worm'],
    ['/publishers/penguin-india', /^Penguin.* · Book Worm$/],
  ])('renders %s', async (path, title) => {
    visit(path);
    await waitFor(() => {
      expect(document.title).toMatch(title);
    });
    expect(screen.queryByText("This page couldn't be displayed")).not.toBeInTheDocument();
  });

  it('shows a not-found page with a link home for unknown paths', async () => {
    visit('/no-such-page');
    expect(await screen.findByText("We couldn't find that page")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the catalogue' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(document.title).toBe('Page not found · Book Worm');
  });
});
