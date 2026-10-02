/**
 * Zod schemas for the checkout forms (S4 delivery address)
 */

import { z } from 'zod';
import type { Address } from '../types';

export type SelectOption = { value: string; label: string };

/** SIMULATED: India-first store, a few neighbouring countries for the select */
export const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'India', label: 'India' },
  { value: 'Nepal', label: 'Nepal' },
  { value: 'Bhutan', label: 'Bhutan' },
  { value: 'Sri Lanka', label: 'Sri Lanka' },
];

export const PHONE_CODE_OPTIONS: SelectOption[] = [
  { value: '+91', label: '+91' },
  { value: '+977', label: '+977' },
  { value: '+975', label: '+975' },
  { value: '+94', label: '+94' },
];

const required = (message: string) =>
  z.string().trim().min(1, message).max(120, 'Keep this under 120 characters');

const oneOf = (options: SelectOption[], message: string) =>
  z.string().refine((value) => options.some((option) => option.value === value), message);

export const addressSchema = z.object({
  firstName: required('Enter your first name'),
  lastName: required('Enter your last name'),
  address: required('Enter your address'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your e-mail')
    .pipe(z.email('Enter a valid e-mail, e.g. name@example.com')),
  city: required('Enter your city'),
  pin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Pin must be 6 digits'),
  phoneCountryCode: oneOf(PHONE_CODE_OPTIONS, 'Choose a country code'),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  state: required('Enter your state'),
  country: oneOf(COUNTRY_OPTIONS, 'Choose a country'),
}) satisfies z.ZodType<Address>;

export type AddressFormValues = z.infer<typeof addressSchema>;

export const emptyAddress: Address = {
  firstName: '',
  lastName: '',
  address: '',
  email: '',
  city: '',
  pin: '',
  phoneCountryCode: '+91',
  phone: '',
  state: '',
  country: 'India',
};
