import { RatingStars } from '@/components/ui/RatingStars';
import type { Review } from '../types';

export type ReviewListProps = {
  reviews: Review[];
};

export function ReviewList({ reviews }: Readonly<ReviewListProps>) {
  if (reviews.length === 0) {
    return (
      <p className="text-14 text-text-secondary">
        No reviews yet. Be the first to review this book.
      </p>
    );
  }

  return (
    <ul aria-label="Reader reviews" className="flex flex-col gap-24">
      {reviews.map((review) => (
        <li key={review.id}>
          <p className="text-16 text-text-primary">{review.name}</p>
          <p className="mt-8 text-14 break-words text-text-secondary">{review.text}</p>
          <RatingStars value={review.rating} className="mt-8" />
        </li>
      ))}
    </ul>
  );
}
