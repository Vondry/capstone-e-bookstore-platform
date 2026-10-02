import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PageShell } from './components/layout/PageShell';
import { ToastProvider } from './components/ui/Toast';

// Lazy-load every route except Home (.bob/rules/04-code-quality.md)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <PageShell>
            <Suspense fallback={<div className="p-24 text-14 text-text-secondary">Loading…</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:handle" element={<HomePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </PageShell>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
