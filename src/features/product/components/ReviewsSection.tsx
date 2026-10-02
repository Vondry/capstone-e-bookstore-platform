import { useState } from 'react';
import { useCustomer } from '../../auth/hooks/useCustomer';
import { useReviews } from '../hooks/useReviews';
import type { ReviewInput } from '../lib/schemas';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { SectionHeading } from './SectionHeading';

export type ReviewsSectionProps = {
  handle: string;
  productId?: string;
};

/** Product reviews: review form with auto-approval and reviewer attribution (D6) */
export function ReviewsSection({ handle, productId }: Readonly<ReviewsSectionProps>) {
  const { reviews, addReview } = useReviews(productId, handle);
  const { data: customer } = useCustomer();
  const [status, setStatus] = useState('');

  const handleSubmit = async (input: ReviewInput) => {
    await addReview(input, customer);
    setStatus('Thanks! Your review has been added.');
  };

  return (
    <section aria-labelledby="reviews-heading">
      <SectionHeading id="reviews-heading">Reviews</SectionHeading>
      <div className="grid gap-32 md:grid-cols-2">
        <div>
          <ReviewForm onSubmit={handleSubmit} />
          {status && (
            <p role="status" className="mt-8 text-14 text-support-success">
              {status}
            </p>
          )}
        </div>
        <ReviewList reviews={reviews} />
      </div>
    </section>
  );
}
