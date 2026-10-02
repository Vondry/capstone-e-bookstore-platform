import { Link } from 'react-router-dom';
import type { WriterSummary } from '../types';

export type WriterCardProps = {
  writer: WriterSummary;
};

export function WriterCard({ writer }: Readonly<WriterCardProps>) {
  return (
    <Link
      to={`/writers/${writer.slug}`}
      className="flex items-center gap-16 bg-layer-1 p-16 transition-colors hover:bg-layer-2"
    >
      {/* Round avatar, as in "About the writer" (wireframe 02) */}
      <img src={writer.avatarUrl} alt="" className="h-48 w-48 shrink-0 rounded-full" />
      <span className="min-w-0">
        <span className="block truncate text-16 text-text-primary">{writer.name}</span>
        <span className="block text-14 text-text-secondary">
          {writer.bookCount} {writer.bookCount === 1 ? 'book' : 'books'}
        </span>
      </span>
    </Link>
  );
}
