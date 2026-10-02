import { Link } from 'react-router-dom';
import type { Publisher } from '../types';

export type PublisherCardProps = {
  publisher: Publisher;
};

export function PublisherCard({ publisher }: Readonly<PublisherCardProps>) {
  return (
    <Link
      to={`/publishers/${publisher.slug}`}
      className="flex h-full flex-col gap-8 bg-layer-1 p-16 transition-colors hover:bg-layer-2"
    >
      <span className="text-16 text-text-primary">{publisher.name}</span>
      <span className="line-clamp-2 text-14 text-text-secondary">{publisher.description}</span>
      <span className="mt-auto text-14 text-text-secondary">
        {publisher.bookCount} {publisher.bookCount === 1 ? 'book' : 'books'}
      </span>
    </Link>
  );
}
