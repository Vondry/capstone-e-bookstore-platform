import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/render';
import { addToWishlist } from '../features/wishlist/lib/wishlist';
import { fetchCart } from '../features/cart/api';
import { WishlistPage } from './WishlistPage';

describe('WishlistPage', () => {
  it('shows an empty state with a link to the catalogue', () => {
    renderWithProviders(<WishlistPage />);
    expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse the catalogue' })).toHaveAttribute('href', '/');
    expect(document.title).toBe('My Wishlist · Book Worm');
  });

  it('lists saved books and removes one', async () => {
    addToWishlist('godaan');
    addToWishlist('madhushala');
    renderWithProviders(<WishlistPage />);

    expect(await screen.findByRole('heading', { name: 'Godaan' })).toBeInTheDocument();
    expect(screen.getByText('2 books saved')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Remove Godaan from wishlist' }));

    expect(screen.queryByRole('heading', { name: 'Godaan' })).not.toBeInTheDocument();
    expect(screen.getByText('1 book saved')).toBeInTheDocument();
  });

  it('adds a saved book to the cart', async () => {
    addToWishlist('godaan');
    renderWithProviders(<WishlistPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Add Godaan to cart' }));

    expect(await screen.findByText('“Godaan” added to your cart')).toBeInTheDocument();
    await waitFor(async () => {
      expect((await fetchCart())?.lines.map((line) => line.book.handle)).toEqual(['godaan']);
    });
  });
});
