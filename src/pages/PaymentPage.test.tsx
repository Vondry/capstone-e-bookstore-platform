import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { addLineItem, updateCart } from '../features/cart/api';
import type { Address } from '../features/checkout/types';
import { formatCurrency } from '../lib/formatters';
import { server } from '../mocks/server';
import { renderWithProviders } from '../test/render';
import { PaymentPage } from './PaymentPage';

const address: Address = {
  firstName: 'Asha',
  lastName: 'Rao',
  address: '12 MG Road',
  email: 'asha@example.com',
  city: 'Bengaluru',
  pin: '560001',
  phoneCountryCode: '+91',
  phone: '9876543210',
  state: 'Karnataka',
  country: 'India',
};

// Every request body sent to the API, and how often the cart was completed
let sentBodies: string[] = [];
let completeCalls = 0;

beforeEach(() => {
  sentBodies = [];
  completeCalls = 0;
  server.events.on('request:start', ({ request }) => {
    const { pathname } = new URL(request.url);
    if (request.method === 'POST' && pathname.endsWith('/complete')) completeCalls += 1;
    if (request.method !== 'GET') {
      void request
        .clone()
        .text()
        .then((body) => sentBodies.push(body));
    }
  });
});

/** Payment methods recorded on the cart (cart metadata, Medusa's place for it) */
function paymentMethodsSent(): unknown[] {
  return sentBodies.flatMap((body) => {
    if (!body) return [];
    const parsed = JSON.parse(body) as { metadata?: { payment_method?: unknown } };
    return parsed.metadata?.payment_method ? [parsed.metadata.payment_method] : [];
  });
}

/** Card details must never leave the payment form */
function expectNoCardDataSent() {
  for (const body of sentBodies) {
    expect(body).not.toMatch(/4111|4000-?0000|12\/2030|cvv|card_number/i);
  }
}

afterEach(() => {
  server.events.removeAllListeners();
});

async function prepareCart({ withAddress = true } = {}) {
  const cart = await addLineItem('variant_07');
  return withAddress ? updateCart({ shippingAddress: address }) : cart;
}

function renderPage() {
  return renderWithProviders(<PaymentPage />, {
    route: '/payment',
    path: '/payment',
    extraRoutes: { '/orders/:id/success': <p>Order placed page</p> },
  });
}

const payButton = () => screen.getByRole('button', { name: /pay now/i });

async function fillCard(user: UserEvent, cardNumber = '4111111111111111') {
  await user.type(await screen.findByLabelText('Card Number'), cardNumber);
  await user.type(screen.getByLabelText('Name on Card'), 'Asha Rao');
  await user.type(screen.getByLabelText('CVV'), '123');
  await user.type(screen.getByLabelText('Date of Expiry'), '122030');
}

describe('PaymentPage', () => {
  it('shows the payable amount, method tabs and the title', async () => {
    const cart = await prepareCart();
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Complete Payment' })).toBeInTheDocument();
    expect(
      screen.getByText(`Payable Amount: ${formatCurrency(cart.totals.total, true)}`)
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Credit Card',
      'Debit card',
      'UPI',
      'Wallet',
    ]);
    expect(document.title).toBe('Payment · Book Worm');
  });

  it('formats the card fields and keeps Pay Now disabled until the form is valid', async () => {
    await prepareCart();
    const user = userEvent.setup();
    renderPage();
    await screen.findByLabelText('Card Number');
    expect(payButton()).toBeDisabled();

    await user.type(screen.getByLabelText('Card Number'), '4111111111111112');
    expect(screen.getByLabelText('Card Number')).toHaveValue('4111-1111-1111-1112');
    await user.tab();
    expect(await screen.findByText('Enter a valid card number')).toBeInTheDocument();
    expect(screen.getByLabelText('Card Number')).toHaveAccessibleDescription(
      'Enter a valid card number'
    );

    await user.clear(screen.getByLabelText('Card Number'));
    await fillCard(user);
    expect(screen.getByLabelText('CVV')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('CVV')).toHaveAttribute('autocomplete', 'cc-csc');
    expect(screen.getByLabelText('Date of Expiry')).toHaveValue('12/2030');
    await waitFor(() => {
      expect(payButton()).toBeEnabled();
    });
  });

  it('pays by card, sends only the method (never card data) and navigates to the success page', async () => {
    await prepareCart();
    const user = userEvent.setup();
    renderPage();
    await fillCard(user);
    await waitFor(() => {
      expect(payButton()).toBeEnabled();
    });
    await user.click(payButton());

    expect(await screen.findByText('Order placed page')).toBeInTheDocument();
    expect(completeCalls).toBe(1);
    expect(paymentMethodsSent()).toEqual(['credit-card']);
    expectNoCardDataSent();
  });

  it('declined card: shows a focused error, keeps number and name, clears CVV, never calls the API', async () => {
    await prepareCart();
    const user = userEvent.setup();
    renderPage();
    await fillCard(user, '4000000000000002');
    await waitFor(() => {
      expect(payButton()).toBeEnabled();
    });
    await user.click(payButton());

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Your card was declined');
    expect(alert).toHaveFocus();
    expect(screen.getByLabelText('Card Number')).toHaveValue('4000-0000-0000-0002');
    expect(screen.getByLabelText('Name on Card')).toHaveValue('Asha Rao');
    expect(screen.getByLabelText('CVV')).toHaveValue('');
    expect(screen.getByLabelText('Date of Expiry')).toHaveValue('12/2030');
    expect(payButton()).toBeDisabled();
    expect(completeCalls).toBe(0);
    expectNoCardDataSent();
  });

  it('shows the API error inline when completing the cart fails', async () => {
    await prepareCart();
    server.use(
      http.post('*/store/carts/:id/complete', () =>
        HttpResponse.json({ message: 'Payment service unavailable' }, { status: 503 })
      )
    );
    const user = userEvent.setup();
    renderPage();
    await fillCard(user);
    await waitFor(() => {
      expect(payButton()).toBeEnabled();
    });
    await user.click(payButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('Payment service unavailable');
    expect(screen.getByLabelText('CVV')).toHaveValue('');
    expect(screen.getByLabelText('Name on Card')).toHaveValue('Asha Rao');
  });

  it('prevents double submit and shows the processing state', async () => {
    await prepareCart();
    server.use(
      http.post('*/store/carts/:id/complete', async () => {
        await delay(150);
        // Falls through to the default handler
      })
    );
    const user = userEvent.setup();
    renderPage();
    await fillCard(user);
    await waitFor(() => {
      expect(payButton()).toBeEnabled();
    });
    await user.dblClick(payButton());

    const processing = await screen.findByRole('button', { name: /processing payment…/i });
    expect(processing).toBeDisabled();
    await user.click(processing);
    expect(await screen.findByText('Order placed page')).toBeInTheDocument();
    expect(completeCalls).toBe(1);
  });

  it('switches tabs with the keyboard and validates the UPI ID', async () => {
    await prepareCart();
    const user = userEvent.setup();
    renderPage();
    await screen.findByLabelText('Card Number');
    screen.getByRole('tab', { name: 'Credit Card' }).focus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'UPI' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'UPI' })).toHaveFocus();
    expect(screen.queryByLabelText('Card Number')).not.toBeInTheDocument();

    const upi = screen.getByLabelText('UPI ID');
    await user.type(upi, 'asha');
    await user.tab();
    expect(await screen.findByText('Enter a UPI ID like name@bank')).toBeInTheDocument();
    expect(payButton()).toBeDisabled();

    await user.type(upi, '@okaxis');
    await waitFor(() => {
      expect(payButton()).toBeEnabled();
    });
    expect(screen.queryByText('Enter a UPI ID like name@bank')).not.toBeInTheDocument();
    await user.click(payButton());
    expect(await screen.findByText('Order placed page')).toBeInTheDocument();
    expect(completeCalls).toBe(1);
    expect(paymentMethodsSent()).toEqual(['upi']);
  });

  it('pays with a wallet', async () => {
    await prepareCart();
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('tab', { name: 'Wallet' }));
    expect(payButton()).toBeDisabled();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Wallet' }), 'PhonePe');
    await waitFor(() => {
      expect(payButton()).toBeEnabled();
    });
    await user.click(payButton());
    expect(await screen.findByText('Order placed page')).toBeInTheDocument();
    expect(completeCalls).toBe(1);
    expect(paymentMethodsSent()).toEqual(['wallet']);
  });

  it('clears the payment error when switching method', async () => {
    await prepareCart();
    const user = userEvent.setup();
    renderPage();
    await fillCard(user, '4000000000000002');
    await waitFor(() => {
      expect(payButton()).toBeEnabled();
    });
    await user.click(payButton());
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'UPI' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an empty state with a link to checkout when there is no cart', async () => {
    renderPage();
    expect(await screen.findByText('Your basket is empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to checkout' })).toHaveAttribute(
      'href',
      '/checkout'
    );
    expect(screen.queryByRole('button', { name: /pay now/i })).not.toBeInTheDocument();
  });

  it('asks for a delivery address when the cart has none', async () => {
    await prepareCart({ withAddress: false });
    renderPage();
    expect(await screen.findByText('Add a delivery address first')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to checkout' })).toHaveAttribute(
      'href',
      '/checkout'
    );
  });
});
