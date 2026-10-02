import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { PageShell } from './PageShell';

/** jsdom has no layout: pretend the viewport is ≥ lg (1056 px) or smaller */
function setDesktop(desktop: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: desktop && query.includes('min-width'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList
  );
}

function renderShell(route: string) {
  return renderWithProviders(
    <PageShell>
      <p>Page content</p>
    </PageShell>,
    { route }
  );
}

/** The sidebar next to <main> (the drawer has its own copy of the category list) */
function sidebar() {
  const layout = screen.getByRole('main').parentElement;
  if (!layout) throw new Error('<main> has no parent');
  return within(layout).queryByRole('navigation', { name: 'Categories' });
}

describe('PageShell', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the header, the page in <main> and the footer', () => {
    setDesktop(true);
    renderShell('/');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Page content');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('shows the category sidebar on the catalogue only', () => {
    setDesktop(true);
    const { unmount } = renderShell('/category/poetry');
    expect(sidebar()).toBeInTheDocument();
    unmount();

    renderShell('/checkout');
    expect(sidebar()).not.toBeInTheDocument();
  });

  it('on desktop the menu button hides and shows the sidebar', async () => {
    setDesktop(true);
    const user = userEvent.setup();
    renderShell('/');
    const menu = screen.getByRole('button', { name: 'Menu' });
    expect(menu).toHaveAttribute('aria-expanded', 'true');

    await user.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(sidebar()).not.toHaveClass('lg:block');

    await user.click(menu);
    expect(sidebar()).toHaveClass('lg:block');
  });

  it('below lg the menu opens a drawer that closes after choosing a category', async () => {
    setDesktop(false);
    const user = userEvent.setup();
    renderShell('/');
    const menu = screen.getByRole('button', { name: 'Menu' });
    expect(menu).toHaveAttribute('aria-expanded', 'false');

    await user.click(menu);
    const drawer = screen.getByRole('dialog', { name: 'Menu' });
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    expect(within(drawer).getByRole('link', { name: 'My Orders' })).toBeInTheDocument();

    await user.click(within(drawer).getByRole('link', { name: 'Poetry' }));
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument();
  });

  it('closes the drawer from a main navigation link', async () => {
    setDesktop(false);
    const user = userEvent.setup();
    renderShell('/orders');
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    const drawer = screen.getByRole('dialog', { name: 'Menu' });
    await user.click(within(drawer).getByRole('link', { name: 'My Wishlist' }));
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument();
  });
});
