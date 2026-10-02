/**
 * WritersPage - "My Writers": browse the brands by writer (deck journey 6)
 */

import { useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useCustomer } from '../features/auth/hooks/useCustomer';
import { BrandGrid } from '../features/brands/components/BrandGrid';
import { BrandNav } from '../features/brands/components/BrandNav';
import { WriterCard } from '../features/brands/components/WriterCard';
import { useWriters } from '../features/brands/hooks/useBrands';
import { yourWriters } from '../features/brands/lib/yourWriters';
import { useBooks } from '../features/catalog/hooks/useBooks';
import { useOrders } from '../features/orders/hooks/useOrders';
import { useWishlist } from '../features/wishlist/hooks/useWishlist';

export function WritersPage() {
  const writersQuery = useWriters();
  const { data: customer } = useCustomer();
  const { data: orders } = useOrders(Boolean(customer));
  const { data: catalogue } = useBooks();
  const wishlist = useWishlist();

  useEffect(() => {
    document.title = 'My Writers · Book Worm';
  }, []);

  const mine = yourWriters(
    writersQuery.data ?? [],
    customer ? (orders ?? []) : [],
    wishlist,
    catalogue ?? []
  );

  return (
    <PageContainer>
      <h1 className="mb-16 text-28 text-text-primary">My Writers</h1>
      <BrandNav />

      {mine.length > 0 && (
        <section aria-labelledby="your-writers" className="mb-32">
          <h2 id="your-writers" className="mb-16 text-20 text-text-primary">
            Your writers
          </h2>
          <p className="-mt-8 mb-16 text-14 text-text-secondary">From your orders and wishlist</p>
          <BrandGrid
            items={mine}
            isLoading={false}
            error={null}
            onRetry={() => undefined}
            getKey={(writer) => writer.slug}
            renderItem={(writer) => <WriterCard writer={writer} />}
          />
        </section>
      )}

      <section aria-labelledby="all-writers">
        <h2 id="all-writers" className="mb-16 text-20 text-text-primary">
          All writers
        </h2>
        <BrandGrid
          items={writersQuery.data}
          isLoading={writersQuery.isLoading}
          error={writersQuery.error}
          onRetry={() => void writersQuery.refetch()}
          emptyTitle="No writers yet"
          getKey={(writer) => writer.slug}
          renderItem={(writer) => <WriterCard writer={writer} />}
        />
      </section>
    </PageContainer>
  );
}
