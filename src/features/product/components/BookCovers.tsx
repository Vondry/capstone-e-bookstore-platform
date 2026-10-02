import type { Book } from '../../catalog/types';

export type BookCoversProps = {
  book: Book;
};

const coverClass =
  'aspect-[2/3] h-auto w-full max-w-[240px] min-w-0 flex-1 self-start bg-layer-1 object-cover md:w-[200px] md:flex-none';

/** Front cover, plus the back cover when the book has one (wireframe shows both side by side) */
export function BookCovers({ book }: Readonly<BookCoversProps>) {
  const alt = `${book.title} by ${book.author.name}`;
  return (
    <div className="flex items-start gap-16 self-start md:shrink-0">
      <img src={book.coverUrl} alt={`${alt} — cover`} className={coverClass} />
      {book.backCoverUrl && (
        <img src={book.backCoverUrl} alt={`${alt} — back cover`} className={coverClass} />
      )}
    </div>
  );
}
