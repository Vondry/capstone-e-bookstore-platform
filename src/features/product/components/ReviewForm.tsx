import { useId } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from '@carbon/icons-react';
import { Button } from '@/components/ui/Button';
import { RatingStarsInput } from '@/components/ui/RatingStars';
import { cn } from '@/lib/utils';
import { REVIEW_MAX_LENGTH, reviewSchema, type ReviewInput } from '../lib/schemas';

export type ReviewFormProps = {
  onSubmit: (input: ReviewInput) => void;
};

export function ReviewForm({ onSubmit }: Readonly<ReviewFormProps>) {
  const id = useId();
  const textId = `${id}-text`;
  const counterId = `${id}-counter`;
  const errorId = `${id}-error`;
  const { register, control, handleSubmit, reset, formState } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { text: '', rating: 0 },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const length = useWatch({ control, name: 'text' }).length;
  const textError = formState.errors.text?.message;

  const submit = handleSubmit((input) => {
    onSubmit(input);
    reset();
  });

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-16">
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <label htmlFor={textId} className="text-12 text-text-secondary">
            Leave Your Review
          </label>
          <span
            id={counterId}
            aria-live="polite"
            className={cn(
              'text-12',
              length > REVIEW_MAX_LENGTH ? 'text-support-error' : 'text-text-secondary'
            )}
          >
            <span className="sr-only">Characters used: </span>
            {length}/{REVIEW_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id={textId}
          rows={5}
          placeholder="What did you think of this book?"
          aria-invalid={textError ? 'true' : 'false'}
          aria-describedby={textError ? `${counterId} ${errorId}` : counterId}
          className={cn(
            'w-full resize-y rounded-none border-0 border-b bg-layer-1 p-16 text-16 text-text-primary placeholder:text-text-placeholder',
            'focus:ring-2 focus:ring-focus focus:outline-hidden',
            textError ? 'border-support-error' : 'border-border'
          )}
          {...register('text')}
        />
        {textError && (
          <p id={errorId} className="text-12 text-support-error">
            {textError}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-16">
        <Controller
          control={control}
          name="rating"
          render={({ field, fieldState }) => (
            <RatingStarsInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          type="submit"
          className="w-full md:w-[160px]"
          icon={<ArrowRight size={20} />}
          loading={formState.isSubmitting}
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
