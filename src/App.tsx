import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageShell } from './components/layout/PageShell';
import { ToastProvider } from './components/ui/Toast';

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
                <Route
                  path="*"
                  element={
                    <p className="p-24 text-14 text-text-secondary">The catalogue is on its way.</p>
                  }
                />
              </Routes>
            </Suspense>
          </PageShell>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
