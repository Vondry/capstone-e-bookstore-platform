import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CategorySidebar } from './CategorySidebar';

function renderSidebar(path = '/', onNavigate?: () => void) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <CategorySidebar onNavigate={onNavigate} />
    </MemoryRouter>
  );
}

describe('CategorySidebar', () => {
  it('renders "All" plus the 19 genres', () => {
    renderSidebar();
    expect(screen.getAllByRole('link')).toHaveLength(20);
    expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Language Learning' })).toHaveAttribute(
      'href',
      '/category/language-learning'
    );
  });

  it('marks "All" as selected on the home page', () => {
    renderSidebar('/');
    expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute('aria-current', 'page');
  });

  it('marks the category from the route as selected', () => {
    renderSidebar('/category/romance');
    const romance = screen.getByRole('link', { name: 'Romance' });
    expect(romance).toHaveAttribute('aria-current', 'page');
    expect(romance).toHaveClass('bg-layer-2', 'border-interactive');
    expect(screen.getByRole('link', { name: 'All' })).not.toHaveAttribute('aria-current');
  });

  it('supports the ?category= query param', () => {
    renderSidebar('/?category=poetry');
    expect(screen.getByRole('link', { name: 'Poetry' })).toHaveAttribute('aria-current', 'page');
  });

  it('calls onNavigate when a category is chosen', async () => {
    const onNavigate = vi.fn();
    renderSidebar('/', onNavigate);
    await userEvent.click(screen.getByRole('link', { name: 'Fantasy' }));
    expect(onNavigate).toHaveBeenCalledOnce();
  });
});
