import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { server } from '../mocks/server';
import { screen, waitFor, within } from '@testing-library/react';
import { loginAsDemo, renderWithProviders } from '../test/render';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('hides "Recommended for You" for guests', async () => {
    renderWithProviders(<HomePage />);
    expect(
      await screen.findByRole('heading', { name: 'Bestsellers this Month' })
    ).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'The Midnight Hour' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Recommended for You' })).not.toBeInTheDocument();
  });

  it('recommends books from the categories of past orders for a logged-in customer', async () => {
    loginAsDemo();
    renderWithProviders(<HomePage />);
    const heading = await screen.findByRole('heading', { name: 'Recommended for You' });
    const section = heading.closest('section');
    if (!section) throw new Error('section missing');
    // The demo customer ordered The Art of Focus (Self Help) and The Midnight Hour (Thriller, Horror)
    expect(await within(section).findAllByRole('article')).toHaveLength(3);
    expect(
      within(section).queryByRole('heading', { name: 'The Art of Focus' })
    ).not.toBeInTheDocument();
  });

  it('replaces the sections with a results grid for an active filter', async () => {
    renderWithProviders(<HomePage />, { route: '/?format=ebook' });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Search Results' })
    ).toBeInTheDocument();
    expect(await screen.findByText(/^Showing \d+ books$/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'New Launches' })).not.toBeInTheDocument();
    expect(document.title).toBe('Home · Book Worm');
  });

  it('names the results after the category and titles the page with it', async () => {
    renderWithProviders(<HomePage />, { route: '/category/poetry', path: '/category/:handle' });
    expect(await screen.findByRole('heading', { level: 1, name: 'Poetry' })).toBeInTheDocument();
    expect(document.title).toBe('Poetry · Book Worm');
  });

  it('shows an error with retry when the results fail to load', async () => {
    let fail = true;
    server.use(
      http.get('*/store/products', () =>
        fail ? HttpResponse.json({ message: 'Server unavailable' }, { status: 500 }) : undefined
      )
    );
    renderWithProviders(<HomePage />, { route: '/?search=godaan' });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Server unavailable');

    fail = false;
    await userEvent.setup().click(within(alert).getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('link', { name: 'Godaan' })).toBeInTheDocument();
  });

  it('keeps the other section when one fails, and retries it', async () => {
    let fail = true;
    server.use(
      http.get('*/store/catalog/bestsellers', () =>
        fail ? HttpResponse.json({ message: 'Ranking down' }, { status: 500 }) : undefined
      )
    );
    renderWithProviders(<HomePage />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Ranking down');
    expect(screen.getByRole('heading', { name: 'New Launches' })).toBeInTheDocument();

    fail = false;
    await userEvent.setup().click(within(alert).getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('heading', { name: 'The Midnight Hour' })).toBeInTheDocument();
  });

  it('retries New Launches on its own', async () => {
    let fail = true;
    server.use(
      http.get('*/store/products', ({ request }) =>
        fail && new URL(request.url).searchParams.get('order') === '-created_at'
          ? HttpResponse.json({ message: 'Launches down' }, { status: 500 })
          : undefined
      )
    );
    renderWithProviders(<HomePage />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Launches down');

    fail = false;
    await userEvent.setup().click(within(alert).getByRole('button', { name: /try again/i }));
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    const launches = screen.getByRole('heading', { name: 'New Launches' }).closest('section');
    if (!launches) throw new Error('New Launches has no section');
    expect(await within(launches).findAllByRole('article')).toHaveLength(3);
  });
});
