import { useId } from 'react';
import { Star, StarFilled } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export type RatingStarsProps = {
  /** Rating between 0 and 5; rounded to the nearest whole star for display */
  value: number;
  size?: 16 | 20;
  className?: string;
};

/** Read-only stars, announced as one image ("Rated 4.0 out of 5") */
export function RatingStars({ value, size = 16, className }: Readonly<RatingStarsProps>) {
  const filled = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
      className={cn('inline-flex items-center gap-4 text-rating', className)}
    >
      {STAR_VALUES.map((star) =>
        star <= filled ? (
          <StarFilled key={star} size={size} aria-hidden="true" />
        ) : (
          <Star key={star} size={size} aria-hidden="true" />
        )
      )}
    </span>
  );
}

export type RatingStarsInputProps = {
  /** Selected rating (1–5), or 0 when nothing is selected */
  value: number;
  onChange: (value: number) => void;
  legend?: string;
  name?: string;
  error?: string;
  onBlur?: () => void;
};

/**
 * Accessible 5-star input: a radio group, so arrow keys move between stars natively.
 * The radios are visually hidden; the star icons are their labels.
 */
export function RatingStarsInput({
  value,
  onChange,
  legend = 'Your rating',
  name,
  error,
  onBlur,
}: Readonly<RatingStarsInputProps>) {
  const generatedId = useId();
  const groupName = name ?? `rating-${generatedId}`;
  const errorId = `${generatedId}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="sr-only">{legend}</legend>
      <div className="-ml-12 flex items-center">
        {STAR_VALUES.map((star) => (
          <label
            key={star}
            className="flex h-48 w-48 cursor-pointer items-center justify-center text-rating has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus"
          >
            <input
              type="radio"
              name={groupName}
              value={star}
              checked={value === star}
              onChange={() => {
                onChange(star);
              }}
              onBlur={onBlur}
              className="sr-only"
            />
            <span className="sr-only">{star === 1 ? '1 star' : `${String(star)} stars`}</span>
            {star <= value ? (
              <StarFilled size={20} aria-hidden="true" />
            ) : (
              <Star size={20} aria-hidden="true" />
            )}
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className="mt-4 text-12 text-support-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
