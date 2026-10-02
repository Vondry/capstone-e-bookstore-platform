import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PageShell } from './components/layout/PageShell';
import { ToastProvider } from './components/ui/Toast';

// Lazy-load every route except Home (.bob/rules/04-code-quality.md)
const ProductPage = lazy(() =>
  import('./pages/ProductPage').then((m) => ({ default: m.ProductPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const PaymentPage = lazy(() =>
  import('./pages/PaymentPage').then((m) => ({ default: m.PaymentPage }))
);
const OrderSuccessPage = lazy(() =>
  import('./pages/OrderSuccessPage').then((m) => ({ default: m.OrderSuccessPage }))
);
const OrdersPage = lazy(() =>
  import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage }))
);
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const WishlistPage = lazy(() =>
  import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);
const WritersPage = lazy(() =>
  import('./pages/WritersPage').then((m) => ({ default: m.WritersPage }))
);
const WriterPage = lazy(() =>
  import('./pages/WriterPage').then((m) => ({ default: m.WriterPage }))
);
const PublishersPage = lazy(() =>
  import('./pages/PublishersPage').then((m) => ({ default: m.PublishersPage }))
);
const PublisherPage = lazy(() =>
  import('./pages/PublisherPage').then((m) => ({ default: m.PublisherPage }))
);
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
                <Route path="/books/:handle" element={<ProductPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id/success" element={<OrderSuccessPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/writers" element={<WritersPage />} />
                <Route path="/writers/:slug" element={<WriterPage />} />
                <Route path="/publishers" element={<PublishersPage />} />
                <Route path="/publishers/:slug" element={<PublisherPage />} />
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
