import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../mocks/server';
import { renderWithProviders } from '../test/render';
import { cartQueryKeys } from '../features/cart/hooks/useCart';
import type { Cart } from '../features/cart/types';
import { isInWishlist } from '../features/wishlist/lib/wishlist';
import { loadReviews } from '../features/product/lib/reviews';
import { ProductPage } from './ProductPage';

function renderProduct(handle = 'joy-of-minimalism') {
  return renderWithProviders(<ProductPage />, {
    route: `/books/${handle}`,
    path: '/books/:handle',
  });
}

async function findTitle() {
  return screen.findByRole('heading', { level: 1, name: 'Joy of Minimalism' });
}

describe('ProductPage (S3)', () => {
  it('renders the product details, breadcrumb, writer and document title', async () => {
    renderProduct();
    await findTitle();

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumb).getByRole('link', { name: 'Non-fiction' })).toHaveAttribute(
      'href',
      '/category/non-fiction'
    );
    expect(within(breadcrumb).getByText('Self Help')).toHaveAttribute('aria-current', 'page');

    expect(
      screen.getByRole('img', { name: 'Joy of Minimalism by Daniel Reed — cover' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Daniel Reed' })).toHaveAttribute(
      'href',
      '/writers/daniel-reed'
    );
    expect(screen.getByRole('link', { name: 'Rupa Publications' })).toHaveAttribute(
      'href',
      '/publishers/rupa-publications'
    );
    expect(screen.getByText('₹149')).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Joy of Minimalism' })).getByText(/Delivery by/)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute(
      'href',
      '/?language=english'
    );
    expect(screen.getByRole('img', { name: 'Rated 4.0 out of 5' })).toBeInTheDocument();
    expect(screen.getByText('210 copies sold')).toBeInTheDocument();
    expect(document.title).toBe('Joy of Minimalism · Book Worm');

    const writer = screen.getByRole('region', { name: 'About the writer' });
    expect(
      await within(writer).findByText(/productivity coach based in San Francisco/)
    ).toBeInTheDocument();
  });

  it('adds the book to the cart through the API and shows a toast', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderProduct();
    await findTitle();

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    expect(await screen.findByText('“Joy of Minimalism” added to your cart')).toBeInTheDocument();
    const cart = queryClient.getQueryData<Cart>(cartQueryKeys.cart);
    expect(cart?.lines).toHaveLength(1);
    expect(cart?.totals.itemCount).toBe(1);
  });

  it('shows an error toast when adding to the cart fails', async () => {
    server.use(
      http.post('*/store/carts', () => HttpResponse.json({ message: 'Down' }, { status: 500 }))
    );
    const user = userEvent.setup();
    renderProduct();
    await findTitle();

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));
    expect(
      await screen.findByText('Could not add “Joy of Minimalism” to your cart. Please try again.')
    ).toBeInTheDocument();
  });

  it('toggles the book in the simulated wishlist', async () => {
    const user = userEvent.setup();
    renderProduct();
    await findTitle();

    const wishlist = screen.getByRole('button', { name: 'Add to Wishlist' });
    expect(wishlist).toHaveAttribute('aria-pressed', 'false');
    await user.click(wishlist);
    expect(wishlist).toHaveAttribute('aria-pressed', 'true');
    expect(isInWishlist('joy-of-minimalism')).toBe(true);
    expect(
      await screen.findByText('“Joy of Minimalism” saved to your wishlist')
    ).toBeInTheDocument();
  });

  it('validates the review (text required, max 100 chars, rating required)', async () => {
    const user = userEvent.setup();
    renderProduct();
    await findTitle();
    const textarea = screen.getByLabelText('Leave Your Review');

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Please write a review')).toBeInTheDocument();
    expect(screen.getByText('Please choose a rating')).toBeInTheDocument();
    expect(textarea).toHaveAttribute('aria-invalid', 'true');

    await user.type(textarea, 'a'.repeat(101));
    expect(screen.getByText('101/100')).toBeInTheDocument();
    expect(await screen.findByText('Reviews can be at most 100 characters')).toBeInTheDocument();
    expect(loadReviews('joy-of-minimalism')).toEqual([]);
  });

  it('submits a review that appears in the list and is stored locally', async () => {
    const user = userEvent.setup();
    renderProduct();
    await findTitle();
    expect(
      screen.getByText('No reviews yet. Be the first to review this book.')
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('Leave Your Review'), 'Calm and practical.');
    expect(screen.getByText('19/100')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: '5 stars' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const list = await screen.findByRole('list', { name: 'Reader reviews' });
    expect(within(list).getByText('Calm and practical.')).toBeInTheDocument();
    expect(within(list).getByText('Guest reader')).toBeInTheDocument();
    expect(within(list).getByRole('img', { name: 'Rated 5.0 out of 5' })).toBeInTheDocument();
    expect(screen.getByText('Thanks! Your review has been added.')).toBeInTheDocument();
    expect(screen.getByLabelText('Leave Your Review')).toHaveValue('');
    expect(loadReviews('joy-of-minimalism')).toHaveLength(1);
  });

  it('shows 3 related reads from the same category, excluding the current book', async () => {
    renderProduct();
    await findTitle();

    const related = screen.getByRole('complementary', { name: 'Related Reads' });
    // Wait for the first related book to load
    await within(related).findByText('The Art of Focus');

    // Card titles are h3 under the section's h2
    const bookTitles = within(related)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(bookTitles).toEqual(['The Art of Focus', 'The Art of Learning', 'The Path to Success']);
    expect(within(related).queryByText('Joy of Minimalism')).not.toBeInTheDocument();
  });

  it('shows a not-found state for an unknown handle', async () => {
    renderProduct('no-such-book');
    expect(await screen.findByText('Book not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse the catalogue' })).toHaveAttribute('href', '/');
    expect(document.title).toBe('Book not found · Book Worm');
  });

  it('shows an error state and recovers on retry', async () => {
    let fail = true;
    server.use(
      http.get('*/store/products', () => {
        if (fail) return HttpResponse.json({ message: 'Server unavailable' }, { status: 500 });
        return undefined;
      })
    );
    const user = userEvent.setup();
    renderProduct();

    expect(await screen.findByText('Could not load this book')).toBeInTheDocument();
    fail = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await findTitle()).toBeInTheDocument();
  });
});
