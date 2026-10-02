import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { loginAsDemo, renderWithProviders } from '../test/render';
import { addLineItem, applyCoupon, fetchCart, removeLineItem } from '../features/cart/api';
import { CheckoutPage } from './CheckoutPage';

// variant_07 Joy of Minimalism ₹149, variant_03 The Path to Success ₹359 (wireframe cart: ₹508)
async function seedWireframeCart() {
  await addLineItem('variant_07');
  await addLineItem('variant_03');
}

function renderCheckout() {
  return renderWithProviders(<CheckoutPage />, {
    route: '/checkout',
    path: '/checkout',
    extraRoutes: { '/payment': <p>Payment page</p> },
  });
}

const grandTotal = () => screen.getByRole('complementary', { name: 'Grand Total' });

async function fillValidAddress(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('First Name'), 'Ravi');
  await user.type(screen.getByLabelText('Last Name'), 'Kumar');
  await user.type(screen.getByLabelText('Address', { selector: 'input' }), '4 Park Street');
  await user.type(screen.getByLabelText('e-mail'), 'ravi@example.com');
  await user.type(screen.getByLabelText('City'), 'Kolkata');
  await user.type(screen.getByLabelText('Pin'), '700016');
  await user.type(screen.getByLabelText('Phone Number'), '9123456780');
  await user.type(screen.getByLabelText('State'), 'West Bengal');
}

describe('CheckoutPage', () => {
  it('renders the cart, breadcrumb and server totals', async () => {
    await seedWireframeCart();
    renderCheckout();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Shopping Cart' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('group', { name: 'Quantity for Joy of Minimalism' })
    ).toHaveTextContent('1');
    expect(
      screen.getByRole('group', { name: 'Quantity for The Path to Success' })
    ).toBeInTheDocument();

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumb).getByRole('link', { name: 'Joy of Minimalism' })).toHaveAttribute(
      'href',
      '/books/joy-of-minimalism'
    );
    expect(within(breadcrumb).getByText('Checkout')).toHaveAttribute('aria-current', 'page');

    const panel = grandTotal();
    expect(within(panel).getByText('Price (2 items)')).toBeInTheDocument();
    expect(within(panel).getByText('₹508.00')).toBeInTheDocument();
    expect(within(panel).getByText('₹60.96')).toBeInTheDocument(); // 12 % tax
    expect(within(panel).getByText('Free')).toBeInTheDocument();
    expect(within(panel).getByText('₹568.96')).toBeInTheDocument();
    expect(document.title).toBe('Checkout · Book Worm');
  });

  it('increases the quantity with +', async () => {
    const user = userEvent.setup();
    await addLineItem('variant_07');
    renderCheckout();

    await user.click(
      await screen.findByRole('button', { name: 'Increase quantity of Joy of Minimalism' })
    );
    expect(screen.getByRole('group', { name: 'Quantity for Joy of Minimalism' })).toHaveTextContent(
      '2'
    );
    expect(await within(grandTotal()).findByText('Price (2 items)')).toBeInTheDocument();
    expect((await fetchCart())?.lines[0]?.quantity).toBe(2);
  });

  it('asks before removing at quantity 0, then removes the item', async () => {
    const user = userEvent.setup();
    await seedWireframeCart();
    renderCheckout();

    await user.click(
      await screen.findByRole('button', { name: 'Decrease quantity of Joy of Minimalism' })
    );
    const dialog = screen.getByRole('alertdialog', {
      name: 'Remove Joy of Minimalism from your cart?',
    });
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('group', { name: 'Quantity for Joy of Minimalism' })
      ).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(await screen.findByText('Removed Joy of Minimalism from your cart')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Quantity for The Path to Success' })
    ).toBeInTheDocument();
  });

  it('keeps the item at quantity 1 when the removal is cancelled', async () => {
    const user = userEvent.setup();
    await addLineItem('variant_07');
    renderCheckout();

    await user.click(
      await screen.findByRole('button', { name: 'Decrease quantity of Joy of Minimalism' })
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Quantity for Joy of Minimalism' })).toHaveTextContent(
      '1'
    );
    expect((await fetchCart())?.lines).toHaveLength(1);
  });

  it('applies a valid coupon and shows the discount', async () => {
    const user = userEvent.setup();
    await seedWireframeCart();
    renderCheckout();

    await user.type(await screen.findByLabelText('Coupon code'), 'bookworm100');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    const panel = grandTotal();
    expect(await within(panel).findByText('BOOKWORM100')).toBeInTheDocument();
    expect(within(panel).getByText('−₹100.00')).toBeInTheDocument();
    // GST on the amount after the coupon: (508 − 100) × 1.12
    expect(within(panel).getByText('₹456.96')).toBeInTheDocument();

    await user.click(within(panel).getByRole('button', { name: 'Remove coupon BOOKWORM100' }));
    expect(await within(panel).findByLabelText('Coupon code')).toBeInTheDocument();
  });

  it('explains why an applied coupon no longer gives a discount', async () => {
    await seedWireframeCart();
    await applyCoupon('BOOKWORM100');
    const cart = await fetchCart();
    const pathToSuccess = cart?.lines.find((line) => line.book.title === 'The Path to Success');
    if (!pathToSuccess) throw new Error('Seed line missing');
    // ₹149 left: below the coupon's ₹300 minimum
    await removeLineItem(pathToSuccess.id);
    renderCheckout();

    const panel = await screen.findByRole('complementary', { name: 'Grand Total' });
    expect(await within(panel).findByText(/not applied/)).toBeInTheDocument();
    expect(
      within(panel).getByText('This coupon needs a minimum order of ₹300')
    ).toBeInTheDocument();
  });

  it('explains a coupon below its minimum order (Medusa skips it without an error)', async () => {
    await addLineItem('variant_07');
    const user = userEvent.setup();
    renderCheckout();
    const input = await screen.findByLabelText('Coupon code');
    await user.type(input, 'BOOKWORM100');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(
      await screen.findByText('This coupon needs a minimum order of ₹300')
    ).toBeInTheDocument();
  });

  it('shows the API message for an invalid coupon', async () => {
    const user = userEvent.setup();
    await addLineItem('variant_07');
    renderCheckout();

    const input = await screen.findByLabelText('Coupon code');
    await user.type(input, 'NOPE');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(await screen.findByText('This coupon code is not valid')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('This coupon code is not valid');
  });

  it('lets a logged-in customer redeem gift points', async () => {
    const user = userEvent.setup();
    loginAsDemo();
    await seedWireframeCart();
    renderCheckout();

    const toggle = await screen.findByRole('switch', { name: 'Redeem gift points' });
    expect(toggle).toHaveAccessibleDescription('Available: 120 points');
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
    const panel = grandTotal();
    expect(within(panel).getByText('Gift points')).toBeInTheDocument();
    expect(within(panel).getByText('−₹120.00')).toBeInTheDocument();
    // GST on the amount after the points: (508 − 120) × 1.12
    expect(within(panel).getByText('₹434.56')).toBeInTheDocument();
  });

  it('shows guests a login hint instead of the gift points toggle', async () => {
    await addLineItem('variant_07');
    renderCheckout();

    expect(await screen.findByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/login?redirect=%2Fcheckout'
    );
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Use Saved Address' })).not.toBeInTheDocument();
  });

  it('prefills the form from the saved address', async () => {
    const user = userEvent.setup();
    loginAsDemo();
    await addLineItem('variant_07');
    renderCheckout();

    await user.click(await screen.findByRole('checkbox', { name: 'Use Saved Address' }));
    expect(screen.getByLabelText('First Name')).toHaveValue('Asha');
    expect(screen.getByLabelText('City')).toHaveValue('Bengaluru');
    expect(screen.getByLabelText('Pin')).toHaveValue('560038');
    expect(screen.getByLabelText('Phone Number')).toHaveValue('9876543210');

    await user.click(screen.getByRole('checkbox', { name: 'Use Saved Address' }));
    expect(screen.getByLabelText('First Name')).toHaveValue('');
  });

  it('shows inline errors and stays on the page when Pay Now is pressed with an invalid form', async () => {
    const user = userEvent.setup();
    await addLineItem('variant_07');
    renderCheckout();

    await user.type(await screen.findByLabelText('Pin'), '123');
    await user.click(screen.getByRole('button', { name: 'Pay Now' }));

    expect(await screen.findByText('Enter your first name')).toBeInTheDocument();
    expect(screen.getByLabelText('Pin')).toHaveAccessibleDescription('Pin must be 6 digits');
    expect(screen.getByText('Phone number must be 10 digits')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toHaveFocus();
    expect(screen.queryByText('Payment page')).not.toBeInTheDocument();
  });

  it('saves the address and goes to /payment when the form is valid', async () => {
    const user = userEvent.setup();
    await addLineItem('variant_07');
    renderCheckout();

    await screen.findByLabelText('First Name');
    await fillValidAddress(user);
    await user.click(screen.getByRole('button', { name: 'Pay Now' }));

    expect(await screen.findByText('Payment page')).toBeInTheDocument();
    const cart = await fetchCart();
    expect(cart?.shippingAddress).toEqual({
      firstName: 'Ravi',
      lastName: 'Kumar',
      address: '4 Park Street',
      email: 'ravi@example.com',
      city: 'Kolkata',
      pin: '700016',
      phoneCountryCode: '+91',
      phone: '9123456780',
      state: 'West Bengal',
      country: 'India',
    });
  });

  it('shows the empty cart state with a link back to the catalogue', async () => {
    renderCheckout();

    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse books' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('button', { name: 'Pay Now' })).not.toBeInTheDocument();
  });

  it('shows an error with retry when the cart cannot be loaded, and keeps the cart', async () => {
    await addLineItem('variant_07');
    server.use(
      http.get(
        '*/store/carts/:id',
        () => HttpResponse.json({ message: 'Server down' }, { status: 500 }),
        {
          once: true,
        }
      )
    );
    renderCheckout();

    expect(await screen.findByRole('alert')).toHaveTextContent('Server down');
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByRole('heading', { name: 'Joy of Minimalism' })).toBeInTheDocument();
  });

  it('falls back to the empty state when the stored cart no longer exists', async () => {
    await addLineItem('variant_07');
    server.use(
      http.get('*/store/carts/:id', () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 })
      )
    );
    renderCheckout();

    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument();
  });

  it('recommends books under the cart, excluding books already in it', async () => {
    await addLineItem('variant_04'); // The Midnight Hour, the top bestseller
    renderCheckout();

    const heading = await screen.findByRole('heading', { name: 'Popular right now' });
    const section = heading.closest('section');
    if (!section) throw new Error('section missing');
    expect(await within(section).findAllByRole('article')).toHaveLength(3);
    expect(
      within(section).queryByRole('heading', { name: 'The Midnight Hour' })
    ).not.toBeInTheDocument();
  });

  it('bases cart recommendations on order history when logged in', async () => {
    loginAsDemo();
    await addLineItem('variant_07');
    renderCheckout();

    expect(await screen.findByRole('heading', { name: 'Recommended for You' })).toBeInTheDocument();
    expect(screen.getByText('Based on the books you’ve ordered before')).toBeInTheDocument();
  });
});
