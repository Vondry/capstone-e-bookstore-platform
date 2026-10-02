import { Currency, Language, Star } from '@carbon/icons-react';
import { RatingStars } from '@/components/ui/RatingStars';
import type { Book } from '../../catalog/types';
import { TextLink } from './TextLink';

export type ProductMetaProps = {
  book: Book;
};

type MetaItemProps = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
};

function MetaItem({ icon, label, children }: Readonly<MetaItemProps>) {
  return (
    <div className="flex gap-8">
      <span aria-hidden="true" className="pt-2 text-text-primary">
        {icon}
      </span>
      <div>
        <dt className="text-14 text-text-primary">{label}</dt>
        <dd className="mt-2 text-14 text-text-primary">{children}</dd>
      </div>
    </div>
  );
}

const soldFormatter = new Intl.NumberFormat('en-IN');

/** Language · Rating · Sells */
export function ProductMeta({ book }: Readonly<ProductMetaProps>) {
  return (
    <dl className="flex flex-wrap gap-x-40 gap-y-16">
      <MetaItem icon={<Language size={16} />} label="Language">
        <TextLink to={`/?language=${encodeURIComponent(book.language.toLowerCase())}`}>
          {book.language}
        </TextLink>
      </MetaItem>
      <MetaItem icon={<Star size={16} />} label="Rating">
        {book.rating === undefined ? 'Not rated yet' : <RatingStars value={book.rating} />}
      </MetaItem>
      <MetaItem icon={<Currency size={16} />} label="Sells">
        <span className="font-semibold">
          {book.soldCount === undefined
            ? 'New release'
            : `${soldFormatter.format(book.soldCount)} copies sold`}
        </span>
      </MetaItem>
    </dl>
  );
}
