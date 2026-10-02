/**
 * Phone number: country code select + 10-digit number (S4 address form)
 */

import type { UseFormReturn } from 'react-hook-form';
import { Select } from '@/components/ui/Select';
import { TextInput } from '@/components/ui/TextInput';
import { PHONE_CODE_OPTIONS } from '../lib/schemas';
import type { Address } from '../types';

export type PhoneFieldProps = {
  form: UseFormReturn<Address>;
  className?: string;
};

export function PhoneField({ form, className }: Readonly<PhoneFieldProps>) {
  const { register, formState } = form;
  return (
    <div className={className}>
      <div className="grid grid-cols-[96px_1fr] gap-8">
        <Select
          label="Code"
          options={PHONE_CODE_OPTIONS}
          className="bg-layer-2 pr-40"
          error={formState.errors.phoneCountryCode?.message}
          autoComplete="tel-country-code"
          {...register('phoneCountryCode')}
        />
        <TextInput
          label="Phone Number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="1234567890"
          maxLength={10}
          className="bg-layer-2"
          error={formState.errors.phone?.message}
          {...register('phone')}
        />
      </div>
    </div>
  );
}
