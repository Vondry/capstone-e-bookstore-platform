/**
 * PublishersPage - browse the brands by publisher (deck journey 6)
 */

import { useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { BrandGrid } from '../features/brands/components/BrandGrid';
import { BrandNav } from '../features/brands/components/BrandNav';
import { PublisherCard } from '../features/brands/components/PublisherCard';
import { usePublishers } from '../features/brands/hooks/useBrands';

export function PublishersPage() {
  const { data, isLoading, error, refetch } = usePublishers();

  useEffect(() => {
    document.title = 'Publishers · Book Worm';
  }, []);

  return (
    <PageContainer>
      <h1 className="mb-16 text-28 text-text-primary">Publishers</h1>
      <BrandNav />
      <BrandGrid
        items={data}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        emptyTitle="No publishers yet"
        getKey={(publisher) => publisher.slug}
        renderItem={(publisher) => <PublisherCard publisher={publisher} />}
      />
    </PageContainer>
  );
}
