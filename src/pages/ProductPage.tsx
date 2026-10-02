/**
 * ProductPage - S3 Product detail (`/books/:handle`), wireframe 02-product-detail.png
 */

import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import type { Book } from '../features/catalog/types';
import { ProductOverview } from '../features/product/components/ProductOverview';
import { ProductSkeleton } from '../features/product/components/ProductSkeleton';
import { RelatedReads } from '../features/product/components/RelatedReads';
import { ReviewsSection } from '../features/product/components/ReviewsSection';
import { WriterSection } from '../features/product/components/WriterSection';
import { useProduct } from '../features/product/hooks/useProduct';
import { buildProductBreadcrumb } from '../features/product/lib/breadcrumb';

type ProductViewProps = {
  book: Book;
};

function ProductView({ book }: Readonly<ProductViewProps>) {
  return (
    <div className="grid gap-32 lg:grid-cols-[minmax(0,1fr)_360px] xlg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="flex min-w-0 flex-col gap-40">
        <div className="flex flex-col gap-16">
          <Breadcrumb items={buildProductBreadcrumb(book)} />
          <ProductOverview book={book} />
        </div>
        <WriterSection author={book.author} />
        <ReviewsSection handle={book.handle} productId={book.id} />
      </div>
      <RelatedReads book={book} />
    </div>
  );
}

function pageTitle(isPending: boolean, book: Book | null | undefined): string {
  if (isPending) return 'Loading book · Book Worm';
  if (book) return `${book.title} · Book Worm`;
  return book === null ? 'Book not found · Book Worm' : 'Book Worm';
}

export function ProductPage() {
  const { handle = '' } = useParams();
  const { data: book, isPending, isError, error, refetch } = useProduct(handle);
  const title = pageTitle(isPending, book);

  useEffect(() => {
    document.title = title;
  }, [title]);

  let content: React.ReactNode;
  if (isPending) {
    content = <ProductSkeleton />;
  } else if (isError) {
    content = (
      <ErrorState title="Could not load this book" error={error} onRetry={() => void refetch()} />
    );
  } else if (!book) {
    content = (
      <EmptyState
        title="Book not found"
        description="This book may have been removed or the link is incorrect."
        action={
          <Link
            to="/"
            className="text-link underline focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden"
          >
            Browse the catalogue
          </Link>
        }
      />
    );
  } else {
    // `key` resets local state (reviews, form) when navigating between books
    content = <ProductView key={book.handle} book={book} />;
  }

  return <PageContainer>{content}</PageContainer>;
}
