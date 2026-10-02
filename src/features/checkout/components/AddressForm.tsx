/**
 * Address panel (S4): "Use Saved Address" + delivery address fields
 */

import type { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { TextInput } from '@/components/ui/TextInput';
import { COUNTRY_OPTIONS } from '../lib/schemas';
import type { Address } from '../types';
import { PhoneField } from './PhoneField';

export const ADDRESS_FORM_ID = 'checkout-address';

export type AddressFormProps = {
  form: UseFormReturn<Address>;
  canUseSavedAddress: boolean;
  savedAddressSelected: boolean;
  onToggleSavedAddress: (checked: boolean) => void;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
};

// 4 columns on md, 2 on lg (the panel is narrower next to Grand Total), 4 again on xlg
const narrow = 'md:col-span-1 lg:col-span-1 xlg:col-span-1';
const wide = 'md:col-span-2 lg:col-span-2 xlg:col-span-2';

type TextFieldName = Exclude<keyof Address, 'phone' | 'phoneCountryCode' | 'country'>;

export function AddressForm({
  form,
  canUseSavedAddress,
  savedAddressSelected,
  onToggleSavedAddress,
  onSubmit,
}: Readonly<AddressFormProps>) {
  const { register, formState } = form;
  const field = (
    name: TextFieldName,
    label: string,
    extra: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <TextInput
      label={label}
      placeholder={label}
      className="bg-layer-2"
      error={formState.errors[name]?.message}
      {...extra}
      {...register(name)}
    />
  );

  return (
    <section aria-labelledby="address-heading" className="bg-layer-1 p-16 md:p-24">
      <h2 id="address-heading" className="text-20 text-text-primary">
        Address
      </h2>
      {canUseSavedAddress && (
        <Checkbox
          label="Use Saved Address"
          checked={savedAddressSelected}
          onChange={onToggleSavedAddress}
          className="mt-8"
        />
      )}
      <form
        id={ADDRESS_FORM_ID}
        noValidate
        onSubmit={(event) => void onSubmit(event)}
        aria-label="Delivery address"
        className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-4 lg:grid-cols-2 xlg:grid-cols-4"
      >
        <div className={narrow}>
          {field('firstName', 'First Name', { autoComplete: 'given-name' })}
        </div>
        <div className={narrow}>
          {field('lastName', 'Last Name', { autoComplete: 'family-name' })}
        </div>
        <div className={wide}>
          {field('address', 'Address', { autoComplete: 'street-address' })}
        </div>
        <div className={wide}>
          {field('email', 'e-mail', { type: 'email', inputMode: 'email', autoComplete: 'email' })}
        </div>
        <div className={narrow}>{field('city', 'City', { autoComplete: 'address-level2' })}</div>
        <div className={narrow}>
          {field('pin', 'Pin', {
            placeholder: '000000',
            inputMode: 'numeric',
            maxLength: 6,
            autoComplete: 'postal-code',
          })}
        </div>
        <PhoneField form={form} className={wide} />
        <div className={narrow}>{field('state', 'State', { autoComplete: 'address-level1' })}</div>
        <div className={narrow}>
          <Select
            label="Country"
            options={COUNTRY_OPTIONS}
            className="bg-layer-2"
            autoComplete="country-name"
            error={formState.errors.country?.message}
            {...register('country')}
          />
        </div>
      </form>
    </section>
  );
}
