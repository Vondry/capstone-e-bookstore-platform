import type { Book } from '../../catalog/types';
import { BookCovers } from './BookCovers';
import { ProductActions } from './ProductActions';
import { ProductInfo } from './ProductInfo';
import { ProductMeta } from './ProductMeta';

export type ProductOverviewProps = {
  book: Book;
};

/** Covers on the left, details, actions and meta row on the right (stacked below md) */
export function ProductOverview({ book }: Readonly<ProductOverviewProps>) {
  return (
    <section aria-labelledby="product-title" className="flex flex-col gap-24 md:flex-row">
      <BookCovers book={book} />
      <div className="flex min-w-0 flex-1 flex-col gap-24">
        <ProductInfo book={book} />
        <ProductActions book={book} />
        <ProductMeta book={book} />
      </div>
    </section>
  );
}
