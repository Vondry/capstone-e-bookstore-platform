/**
 * WriterPage - a writer's profile and books (deck journey 6, `/writers/:slug`)
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { BrandBooks } from '../features/brands/components/BrandBooks';
import { BrandNotFound } from '../features/brands/components/BrandNotFound';
import { useWriter } from '../features/product/hooks/useProduct';

export function WriterPage() {
  const { slug = '' } = useParams();
  const { data: writer, isLoading, error, refetch } = useWriter(slug);

  useEffect(() => {
    document.title = `${writer?.name ?? 'Writer'} · Book Worm`;
  }, [writer?.name]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div aria-busy="true" className="flex gap-24">
          <Skeleton className="h-[96px] w-[96px] rounded-full" />
          <Skeleton className="h-[96px] flex-1" />
        </div>
      );
    }
    if (error) {
      return (
        <ErrorState
          title="Couldn't load this writer"
          error={error}
          onRetry={() => void refetch()}
        />
      );
    }
    if (!writer) {
      return <BrandNotFound kind="writer" />;
    }
    return (
      <>
        <Breadcrumb
          items={[
            { label: 'Home', to: '/' },
            { label: 'Writers', to: '/writers' },
            { label: writer.name },
          ]}
        />
        <div className="mt-24 flex flex-col gap-24 md:flex-row">
          <img src={writer.avatarUrl} alt="" className="h-[96px] w-[96px] shrink-0 rounded-full" />
          <div>
            <h1 className="text-28 text-text-primary">{writer.name}</h1>
            {writer.bio.map((paragraph) => (
              <p key={paragraph} className="mt-8 max-w-[800px] text-14 text-text-secondary">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        <BrandBooks title={`Books by ${writer.name}`} filter={{ author: writer.slug }} />
      </>
    );
  };

  return <PageContainer>{renderContent()}</PageContainer>;
}
