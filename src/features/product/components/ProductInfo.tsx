import { Fragment } from 'react';
import { formatCurrency, formatDeliveryDate } from '@/lib/formatters';
import type { Book } from '../../catalog/types';
import { TextLink } from './TextLink';

export type ProductInfoProps = {
  book: Book;
};

/** Title, author, description, publisher, format, categories, price and delivery estimate */
export function ProductInfo({ book }: Readonly<ProductInfoProps>) {
  // SIMULATED: delivery estimate = order date + 3 business days (eBook → Instant)
  const delivery = formatDeliveryDate(book.format, new Date());

  return (
    <div className="flex flex-col">
      <h1 id="product-title" className="text-20 font-normal text-text-primary md:text-28">
        {book.title}
      </h1>
      <p className="mt-8 text-14 text-text-primary">
        by <TextLink to={`/writers/${book.author.slug}`}>{book.author.name}</TextLink>
      </p>
      <p className="mt-8 text-14 text-text-secondary">{book.description}</p>

      {book.publisher && (
        <p className="mt-24 text-14 text-text-primary">
          <span className="font-semibold">Published by:</span>{' '}
          <TextLink to={`/publishers/${book.publisher.slug}`}>{book.publisher.name}</TextLink>
        </p>
      )}

      <p className="mt-24 text-14 text-text-primary">{book.format}</p>
      {book.categories.length > 0 && (
        <p className="mt-8 text-14 text-text-primary">
          {book.categories.map((category, index) => (
            <Fragment key={category.id}>
              {index > 0 && ', '}
              <TextLink to={`/category/${category.handle}`}>{category.name}</TextLink>
            </Fragment>
          ))}
        </p>
      )}

      <p className="mt-24 text-32 font-semibold text-text-primary">
        {formatCurrency(book.priceInr)}
      </p>
      <p className="text-14 text-text-primary">
        {book.format === 'eBook' ? 'Delivery: ' : 'Delivery by '}
        <strong className="font-semibold">{delivery}</strong>
      </p>
    </div>
  );
}
