import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { db, resetDb } from '../mocks/db';
import { loginAsDemo, renderWithProviders } from '../test/render';
import { OrdersPage } from './OrdersPage';

const HOUR = 60 * 60 * 1000;
const NOW = new Date('2026-10-01T12:00:00.000Z');

function renderPage() {
  return renderWithProviders(<OrdersPage />, {
    route: '/orders',
    path: '/orders',
    extraRoutes: { '/login': <p>Login page</p>, '/': <p>Catalogue page</p> },
  });
}

async function findOrder(displayId: number) {
  const heading = await screen.findByRole('heading', { name: `Order #${String(displayId)}` });
  const section = heading.closest('section');
  if (!section) throw new Error('Order section not found');
  return section;
}

describe('OrdersPage (S7)', () => {
  beforeEach(() => {
    // Only Date and setInterval (the page clock) are faked; MSW, React Query and toasts keep real setTimeout
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(NOW);
    resetDb(Date.now());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets the document title', () => {
    renderPage();
    expect(document.title).toBe('My Orders · Book Worm');
    expect(screen.getByRole('heading', { level: 1, name: 'My Orders' })).toBeInTheDocument();
  });

  it('shows a login prompt to guests without calling the orders API', async () => {
    const ordersRequest = vi.fn();
    server.events.on('request:start', ({ request }) => {
      if (new URL(request.url).pathname === '/store/orders') ordersRequest();
    });
    renderPage();

    const link = await screen.findByRole('link', { name: 'Log in' });
    expect(link).toHaveAttribute('href', '/login?redirect=/orders');
    expect(ordersRequest).not.toHaveBeenCalled();
    server.events.removeAllListeners();
  });

  it('lists orders newest first with date, status, item count and total', async () => {
    loginAsDemo();
    renderPage();

    await findOrder(1002);
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .filter((h) => h.textContent.startsWith('Order #'))
      .map((h) => h.textContent);
    expect(headings).toEqual(['Order #1002', 'Order #1001']);

    const recent = await findOrder(1002);
    expect(within(recent).getByText(/Placed on/)).toHaveTextContent('Placed on Thu, 1 Oct 2026');
    expect(within(recent).getByText('Placed')).toBeInTheDocument();
    expect(within(recent).getByText('2 items')).toBeInTheDocument();
    expect(within(recent).getByText(/₹[\d,]+\.\d{2}/)).toBeInTheDocument();
    expect(within(recent).getAllByRole('article')).toHaveLength(2);
  });

  it('adds a book to the cart with Buy it again and shows a toast', async () => {
    loginAsDemo();
    const user = userEvent.setup();
    renderPage();

    const older = await findOrder(1001);
    const button = within(older).getByRole('button', { name: /Buy .* again/ });
    const title = (button.getAttribute('aria-label') ?? '').replace(/^Buy (.*) again$/, '$1');
    await user.click(button);

    expect(await screen.findByText(`Added ${title} to your cart`)).toBeInTheDocument();
    const carts = Object.values(db.carts);
    expect(carts).toHaveLength(1);
    expect(carts[0]?.lines).toHaveLength(1);
    expect(carts[0]?.lines[0]?.quantity).toBe(1);
  });

  it('shows an error toast when Buy it again fails', async () => {
    loginAsDemo();
    server.use(
      http.post('*/store/carts', () => HttpResponse.json({ message: 'Down' }, { status: 500 })),
      http.post('*/store/carts/:id/line-items', () =>
        HttpResponse.json({ message: 'Down' }, { status: 500 })
      )
    );
    const user = userEvent.setup();
    renderPage();

    const older = await findOrder(1001);
    await user.click(within(older).getByRole('button', { name: /Buy .* again/ }));
    expect(await screen.findByText(/Could not add .* to your cart/)).toBeInTheDocument();
  });

  it('offers Cancel order only for the order placed within 48 h', async () => {
    loginAsDemo();
    renderPage();

    const recent = await findOrder(1002);
    const older = await findOrder(1001);
    expect(within(recent).getByRole('button', { name: 'Cancel order' })).toBeInTheDocument();
    expect(within(recent).getByText('You can cancel for another 46 h')).toBeInTheDocument();
    expect(within(older).queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument();
  });

  it('requests cancellation after confirming', async () => {
    loginAsDemo();
    const user = userEvent.setup();
    renderPage();

    const recent = await findOrder(1002);
    await user.click(within(recent).getByRole('button', { name: 'Cancel order' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Cancel order #1002?' });
    await user.click(within(dialog).getByRole('button', { name: 'Request cancellation' }));

    expect(await within(recent).findByText('Cancellation requested')).toBeInTheDocument();
    expect(screen.getByText('Cancellation requested for order #1002')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(within(recent).queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument();
    expect(screen.queryByText(/^Cancelled$/)).not.toBeInTheDocument();
  });

  it('keeps the order unchanged when the dialog is dismissed', async () => {
    loginAsDemo();
    const user = userEvent.setup();
    renderPage();

    const recent = await findOrder(1002);
    await user.click(within(recent).getByRole('button', { name: 'Cancel order' }));
    await user.click(screen.getByRole('button', { name: 'Keep order' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(within(recent).getByText('Placed')).toBeInTheDocument();
    expect(within(recent).getByRole('button', { name: 'Cancel order' })).toBeInTheDocument();
    expect(db.orders.find((o) => o.displayId === 1002)?.status).toBe('placed');
  });

  it('hides Cancel order once the 48 h window has passed', async () => {
    loginAsDemo();
    renderPage();

    const recent = await findOrder(1002);
    expect(within(recent).getByRole('button', { name: 'Cancel order' })).toBeInTheDocument();

    // #1002 was placed 2 h before NOW: 45 h later one hour is left
    act(() => {
      vi.advanceTimersByTime(45 * HOUR);
    });
    expect(within(recent).getByText('You can cancel for another 1 h')).toBeInTheDocument();

    // ...and 46 h later it is exactly 48 h old, so it can no longer be cancelled
    act(() => {
      vi.advanceTimersByTime(HOUR);
    });
    expect(within(recent).queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument();
    expect(within(recent).getByText('Placed')).toBeInTheDocument();
  });

  it('shows an error toast when the server rejects the cancellation', async () => {
    loginAsDemo();
    server.use(
      http.post('*/store/orders/:id/cancel-request', () =>
        HttpResponse.json(
          { message: 'Orders can only be cancelled within 48 hours' },
          { status: 400 }
        )
      )
    );
    const user = userEvent.setup();
    renderPage();

    const recent = await findOrder(1002);
    await user.click(within(recent).getByRole('button', { name: 'Cancel order' }));
    await user.click(screen.getByRole('button', { name: 'Request cancellation' }));

    expect(
      await screen.findByText('Orders can only be cancelled within 48 hours')
    ).toBeInTheDocument();
    expect(within(recent).getByText('Placed')).toBeInTheDocument();
  });

  it('shows an empty state when the customer has no orders', async () => {
    loginAsDemo();
    server.use(http.get('*/store/orders', () => HttpResponse.json({ orders: [], count: 0 })));
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('No orders yet')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Browse the catalogue' }));
    expect(screen.getByText('Catalogue page')).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    loginAsDemo();
    let fail = true;
    server.use(
      http.get('*/store/orders', () => {
        if (fail) return HttpResponse.json({ message: 'Server unavailable' }, { status: 500 });
        return HttpResponse.json({ orders: [], count: 0 });
      })
    );
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load your orders");
    fail = false;
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(await screen.findByText('No orders yet')).toBeInTheDocument();
  });
});
