import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';

export type BrandNotFoundProps = {
  kind: 'writer' | 'publisher';
};

export function BrandNotFound({ kind }: Readonly<BrandNotFoundProps>) {
  const listPath = kind === 'writer' ? '/writers' : '/publishers';
  return (
    <>
      <h1 className="sr-only">{kind === 'writer' ? 'Writer' : 'Publisher'} not found</h1>
      <EmptyState
        title={`We couldn't find this ${kind}`}
        action={
          <Link to={listPath} className="text-14 text-link underline">
            Browse all {kind}s
          </Link>
        }
      />
    </>
  );
}
