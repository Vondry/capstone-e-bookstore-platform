import { z } from 'zod';

export const REVIEW_MAX_LENGTH = 100;

export const reviewSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Please write a review')
    .max(REVIEW_MAX_LENGTH, `Reviews can be at most ${String(REVIEW_MAX_LENGTH)} characters`),
  rating: z.number().int().min(1, 'Please choose a rating').max(5, 'Please choose a rating'),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
