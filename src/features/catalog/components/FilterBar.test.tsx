import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { FilterBar, SEARCH_DEBOUNCE_MS } from './FilterBar';
import { DEFAULT_FILTERS } from '../types';

function renderFilterBar(search = '') {
  const onFiltersChange = vi.fn();
  const utils = render(
    <FilterBar filters={{ ...DEFAULT_FILTERS, search }} onFiltersChange={onFiltersChange} />
  );
  const input = screen.getByLabelText('Search you want to read here');
  return { ...utils, input, onFiltersChange };
}

describe('FilterBar search', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates the input immediately but applies the search only after typing pauses', () => {
    const { input, onFiltersChange } = renderFilterBar();

    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ar' } });
    fireEvent.change(input, { target: { value: 'art' } });

    expect(input).toHaveValue('art');
    expect(onFiltersChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(onFiltersChange).toHaveBeenCalledOnce();
    expect(onFiltersChange).toHaveBeenCalledWith({ search: 'art' });
  });

  it('syncs the input when the search is cleared from outside', () => {
    const { input, rerender, onFiltersChange } = renderFilterBar('art');
    expect(input).toHaveValue('art');

    rerender(<FilterBar filters={DEFAULT_FILTERS} onFiltersChange={onFiltersChange} />);

    expect(input).toHaveValue('');
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    expect(onFiltersChange).not.toHaveBeenCalled();
  });

  it('applies other filters immediately', () => {
    const { onFiltersChange } = renderFilterBar();

    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'hindi' } });

    expect(onFiltersChange).toHaveBeenCalledWith({ language: 'hindi' });
  });

  it('applies format, price range and sort changes', () => {
    const { onFiltersChange } = renderFilterBar();

    fireEvent.change(screen.getByLabelText('Format (Paperback, ebook etc)'), {
      target: { value: 'ebook' },
    });
    fireEvent.change(screen.getByLabelText('Price Range'), { target: { value: '200-400' } });
    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'price-desc' } });

    expect(onFiltersChange).toHaveBeenCalledWith({ format: 'ebook' });
    expect(onFiltersChange).toHaveBeenCalledWith({ priceMin: 200, priceMax: 400 });
    expect(onFiltersChange).toHaveBeenCalledWith({ sortBy: 'price-desc' });
  });

  it('shows the selected price range and ignores an unknown one', () => {
    const onFiltersChange = vi.fn();
    render(
      <FilterBar
        filters={{ ...DEFAULT_FILTERS, priceMin: 400, priceMax: 600 }}
        onFiltersChange={onFiltersChange}
      />
    );
    const select = screen.getByLabelText('Price Range');
    expect(select).toHaveValue('400-600');

    fireEvent.change(select, { target: { value: 'not-a-range' } });
    expect(onFiltersChange).not.toHaveBeenCalled();
  });

  it('shows the result count and a clear button when filters are active', () => {
    const onClearFilters = vi.fn();
    render(
      <FilterBar
        filters={{ ...DEFAULT_FILTERS, format: 'ebook' }}
        onFiltersChange={vi.fn()}
        onClearFilters={onClearFilters}
        resultCount={1}
        hasActiveFilters
      />
    );
    expect(screen.getByText('Showing 1 book')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(onClearFilters).toHaveBeenCalled();
  });
});
