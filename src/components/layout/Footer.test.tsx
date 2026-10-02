import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders a labelled footer navigation and the copyright', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const nav = screen.getByRole('navigation', { name: 'Footer' });
    expect(within(nav).getByRole('link', { name: 'My Wishlist' })).toHaveAttribute(
      'href',
      '/wishlist'
    );
    expect(within(nav).getByRole('link', { name: 'Publishers' })).toHaveAttribute(
      'href',
      '/publishers'
    );
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© ');
  });
});
