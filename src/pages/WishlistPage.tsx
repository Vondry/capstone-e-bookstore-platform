/**
 * WishlistPage - "My Wishlist" (S8 in .bob/rules/03-screens.md)
 * SIMULATED: the wishlist lives in localStorage (see features/wishlist/lib/wishlist.ts)
 */

import { useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ButtonLink } from '../components/ui/ButtonLink';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { BookCard } from '../features/catalog/components/BookCard';
import { BookGrid } from '../features/catalog/components/BookGrid';
import { useBooks } from '../features/catalog/hooks/useBooks';
import { WishlistItemActions } from '../features/wishlist/components/WishlistItemActions';
import { useWishlist } from '../features/wishlist/hooks/useWishlist';

export function WishlistPage() {
  const handles = useWishlist();
  const { data: catalogue, isLoading, error, refetch } = useBooks();

  useEffect(() => {
    document.title = 'My Wishlist · Book Worm';
  }, []);

  const books = handles.flatMap(
    (handle) => catalogue?.filter((book) => book.handle === handle) ?? []
  );

  const renderContent = () => {
    if (handles.length === 0) {
      return (
        <EmptyState
          title="Your wishlist is empty"
          description="Save books with “Add to Wishlist” on a book's page to find them here later."
          action={<ButtonLink to="/">Browse the catalogue</ButtonLink>}
        />
      );
    }
    if (isLoading) {
      return <BookGrid books={[]} loading />;
    }
    if (error) {
      return (
        <ErrorState
          title="Couldn't load your wishlist"
          error={error}
          onRetry={() => void refetch()}
        />
      );
    }
    return (
      <>
        <p className="mb-16 text-14 text-text-secondary" aria-live="polite">
          {books.length} {books.length === 1 ? 'book' : 'books'} saved
        </p>
        <ul className="grid grid-cols-1 gap-24 md:grid-cols-2 xlg:grid-cols-3">
          {books.map((book) => (
            <li key={book.id}>
              <BookCard book={book}>
                <WishlistItemActions book={book} />
              </BookCard>
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <PageContainer>
      <h1 className="mb-24 text-28 text-text-primary">My Wishlist</h1>
      {renderContent()}
    </PageContainer>
  );
}
