/**
 * PublisherPage - a publisher and its books (deck journey 6, `/publishers/:slug`)
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { BrandBooks } from '../features/brands/components/BrandBooks';
import { BrandNotFound } from '../features/brands/components/BrandNotFound';
import { usePublisher } from '../features/brands/hooks/useBrands';

export function PublisherPage() {
  const { slug = '' } = useParams();
  const { data: publisher, isLoading, error, refetch } = usePublisher(slug);

  useEffect(() => {
    document.title = `${publisher?.name ?? 'Publisher'} · Book Worm`;
  }, [publisher?.name]);

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-[96px] w-full" />;
    }
    if (error) {
      return (
        <ErrorState
          title="Couldn't load this publisher"
          error={error}
          onRetry={() => void refetch()}
        />
      );
    }
    if (!publisher) {
      return <BrandNotFound kind="publisher" />;
    }
    return (
      <>
        <Breadcrumb
          items={[
            { label: 'Home', to: '/' },
            { label: 'Publishers', to: '/publishers' },
            { label: publisher.name },
          ]}
        />
        <h1 className="mt-24 text-28 text-text-primary">{publisher.name}</h1>
        <p className="mt-8 max-w-[800px] text-14 text-text-secondary">{publisher.description}</p>
        <BrandBooks title={`Books from ${publisher.name}`} filter={{ publisher: publisher.slug }} />
      </>
    );
  };

  return <PageContainer>{renderContent()}</PageContainer>;
}
