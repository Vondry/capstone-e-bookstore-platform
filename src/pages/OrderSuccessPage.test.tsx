import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { db } from '@/mocks/db';
import { loginAsDemo, renderWithProviders } from '@/test/render';
import { OrderSuccessPage } from './OrderSuccessPage';

const SEED_ID = 'order_seed_1002';
const HEADING = /your purchase of the following reads is successful/i;

function renderPage(id = SEED_ID) {
  return renderWithProviders(<OrderSuccessPage />, {
    route: `/orders/${id}/success`,
    path: '/orders/:id/success',
    extraRoutes: { '/': <p>Home page</p> },
  });
}

function seededOrder() {
  const order = db.orders.find((o) => o.id === SEED_ID);
  if (!order) throw new Error('Seed order missing');
  return order;
}

describe('OrderSuccessPage', () => {
  it('shows the purchased books, order number and points earned', async () => {
    const order = seededOrder();
    loginAsDemo();
    renderPage();

    expect(screen.getByRole('status', { name: /loading your order/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: HEADING })).toBeInTheDocument();

    const list = screen.getByRole('list', { name: /purchased books/i });
    for (const line of order.lines) {
      expect(
        within(list).getByRole('heading', { level: 2, name: line.book.title })
      ).toBeInTheDocument();
    }
    expect(within(list).getAllByRole('listitem')).toHaveLength(order.lines.length);
    expect(screen.getByText('Order #1002')).toBeInTheDocument();
    expect(
      screen.getByText(`You earned ${String(order.pointsEarned)} gift points`)
    ).toBeInTheDocument();
    expect(document.title).toBe('Order confirmed · Book Worm');
  });

  it('moves focus to the heading on load', async () => {
    renderPage();
    const heading = await screen.findByRole('heading', { level: 1, name: HEADING });
    await waitFor(() => {
      expect(heading).toHaveFocus();
    });
  });

  it('navigates home with "Continue your Shopping"', async () => {
    const user = userEvent.setup();
    renderPage();
    const cta = await screen.findByRole('link', { name: /continue your shopping/i });
    expect(cta).toHaveAttribute('href', '/');
    await user.click(cta);
    expect(await screen.findByText('Home page')).toBeInTheDocument();
  });

  it('invites guests to log in to collect points, without claiming they earned any', async () => {
    renderPage();
    const link = await screen.findByRole('link', { name: /log in to collect points next time/i });
    const successPath = `/orders/${SEED_ID}/success`;
    expect(link).toHaveAttribute('href', `/login?redirect=${encodeURIComponent(successPath)}`);
    expect(
      screen.getByText(
        `This order would have earned ${String(seededOrder().pointsEarned)} gift points.`,
        {
          exact: false,
        }
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/you earned/i)).not.toBeInTheDocument();
  });

  it('does not show the login hint to a logged-in customer', async () => {
    loginAsDemo();
    const { queryClient } = renderPage();
    await screen.findByRole('heading', { level: 1, name: HEADING });
    await waitFor(() => {
      expect(queryClient.getQueryState(['customer'])?.status).toBe('success');
    });
    expect(
      screen.queryByRole('link', { name: /log in to collect points/i })
    ).not.toBeInTheDocument();
  });

  it('shows "Qty n" when a book was bought more than once', async () => {
    const [firstLine] = seededOrder().lines;
    if (!firstLine) throw new Error('Seed order has no lines');
    firstLine.quantity = 2;
    renderPage();
    expect(await screen.findByText('Qty 2')).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown order', async () => {
    renderPage('order_missing');
    expect(await screen.findByText(/we couldn't find that order/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to the catalogue/i })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('shows an error state and recovers on retry', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        '*/store/orders/:id',
        () => HttpResponse.json({ message: 'Server exploded' }, { status: 500 }),
        {
          once: true,
        }
      )
    );
    renderPage();

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/we couldn't load your order/i)).toBeInTheDocument();

    await user.click(within(alert).getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('heading', { level: 1, name: HEADING })).toBeInTheDocument();
  });
});
