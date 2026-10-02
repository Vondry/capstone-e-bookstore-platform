import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RouteErrorBoundary } from './RouteErrorBoundary';

function Broken(): never {
  throw new Error('Chunk failed to load');
}

describe('RouteErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its children when nothing fails', () => {
    render(
      <RouteErrorBoundary>
        <p>Catalogue</p>
      </RouteErrorBoundary>
    );
    expect(screen.getByText('Catalogue')).toBeInTheDocument();
  });

  it('shows an error state with a retry instead of a blank page, and logs the error', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <RouteErrorBoundary>
        <Broken />
      </RouteErrorBoundary>
    );
    expect(screen.getByRole('alert')).toHaveTextContent("This page couldn't be displayed");
    expect(screen.getByText('Chunk failed to load')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(log).toHaveBeenCalledWith('Route crashed', expect.any(Error), expect.any(String));
  });
});
