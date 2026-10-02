import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS } from '../types';
import { useFilters } from './useFilters';

function setup(url = '/') {
  const location = { current: '' };
  function Probe() {
    const { pathname, search } = useLocation();
    location.current = pathname + search;
    return null;
  }
  const { result } = renderHook(() => useFilters(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          {['/', '/category/:handle'].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <>
                  {children}
                  <Probe />
                </>
              }
            />
          ))}
        </Routes>
      </MemoryRouter>
    ),
  });
  return { result, location };
}

describe('useFilters', () => {
  it('starts from the defaults on the home page', () => {
    const { result } = setup();
    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('reads every filter from the URL, the category from the path', () => {
    const { result } = setup(
      '/category/poetry?search=rain&language=hindi&format=ebook&priceMin=200&priceMax=400&sortBy=price-asc'
    );
    expect(result.current.filters).toEqual({
      search: 'rain',
      language: 'hindi',
      format: 'ebook',
      priceMin: 200,
      priceMax: 400,
      sortBy: 'price-asc',
      category: 'poetry',
    });
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('falls back to ?category= when the path has none', () => {
    const { result } = setup('/?category=travel');
    expect(result.current.filters.category).toBe('travel');
  });

  it('writes filters to the URL, leaving defaults out', () => {
    const { result, location } = setup();
    act(() => {
      result.current.updateFilters({ category: 'self-help', format: 'paperback', priceMax: 10000 });
    });
    expect(location.current).toBe('/category/self-help?format=paperback');
    expect(result.current.filters.format).toBe('paperback');
  });

  it('keeps both changes when two filters change before the URL updates', () => {
    const { result, location } = setup();
    act(() => {
      result.current.updateFilters({ priceMin: 200, priceMax: 400 });
      result.current.setFilter('sortBy', 'price-asc');
    });
    expect(location.current).toBe('/?priceMin=200&priceMax=400&sortBy=price-asc');
  });

  it('clears everything, including the category', () => {
    const { result, location } = setup('/category/poetry?search=rain');
    act(() => {
      result.current.clearFilters();
    });
    expect(location.current).toBe('/');
    expect(result.current.hasActiveFilters).toBe(false);
  });
});
