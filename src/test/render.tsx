/**
 * Test helper: renders UI with the app's providers (Query, Router, Toast).
 * The network is mocked by MSW (see src/test/setup.ts); log in with `loginAsDemo()`.
 */

import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../components/ui/Toast';
import { AUTH_TOKEN_KEY } from '../lib/medusa';

export type RenderOptions = {
  /** Initial URL, e.g. '/books/godaan' */
  route?: string;
  /** Route pattern the UI is mounted on, e.g. '/books/:handle' */
  path?: string;
  /** Extra routes, e.g. to assert navigation: { '/payment': <p>Payment page</p> } */
  extraRoutes?: Record<string, React.ReactNode>;
};

export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/', path = '*', extraRoutes = {} }: RenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
            {Object.entries(extraRoutes).map(([extraPath, element]) => (
              <Route key={extraPath} path={extraPath} element={element} />
            ))}
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
  return { ...result, queryClient };
}

/** Logs the test in as the seeded demo customer (see src/mocks/db.ts) */
export function loginAsDemo(): void {
  localStorage.setItem(AUTH_TOKEN_KEY, 'mock-token-cus_demo');
}
