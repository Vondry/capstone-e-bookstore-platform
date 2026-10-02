/**
 * Zod schemas for the S1 login and register forms
 */

import { z } from 'zod';

export const PASSWORD_MIN = 8;

const email = z
  .string()
  .trim()
  .min(1, 'Enter your e-mail address')
  .pipe(z.email('Enter a valid e-mail address, e.g. name@example.com'));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name').max(50, 'Use at most 50 characters'),
  lastName: z.string().trim().min(1, 'Enter your last name').max(50, 'Use at most 50 characters'),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN, `Use at least ${String(PASSWORD_MIN)} characters`)
    .max(72, 'Use at most 72 characters'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
