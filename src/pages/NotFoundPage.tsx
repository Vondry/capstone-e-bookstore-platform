/**
 * NotFoundPage - unknown routes
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/ui/EmptyState';

export function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found · Book Worm';
  }, []);

  return (
    <PageContainer>
      <h1 className="sr-only">Page not found</h1>
      <EmptyState
        title="We couldn't find that page"
        description="It may have moved, or it isn't built yet."
        action={
          <Link to="/" className="text-14 text-link underline">
            Back to the catalogue
          </Link>
        }
      />
    </PageContainer>
  );
}
