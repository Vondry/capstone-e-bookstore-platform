/**
 * Coupon input + Apply (S4). SIMULATED coupon catalogue, see lib/totals.ts
 */

import { useId, useState } from 'react';
import { Close } from '@carbon/icons-react';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { useApplyCoupon, useRemoveCoupon } from '../../cart/hooks/useCart';
import { validateCoupon } from '../lib/totals';

export type CouponFieldProps = {
  appliedCode: string | null;
  /** Used to explain why an applied code no longer gives a discount (e.g. below its minimum) */
  subtotal: number;
};

export function CouponField({ appliedCode, subtotal }: Readonly<CouponFieldProps>) {
  const [code, setCode] = useState('');
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const errorId = useId();
  const error = applyCoupon.error?.message ?? removeCoupon.error?.message ?? null;

  if (appliedCode) {
    const validation = validateCoupon(appliedCode, subtotal);
    return (
      <div className="flex min-h-48 items-center justify-between gap-16">
        <p className="text-14 text-text-primary" role="status">
          Coupon <strong className="font-semibold">{appliedCode}</strong>{' '}
          {validation.ok ? (
            'applied'
          ) : (
            <>
              not applied
              <span className="block text-12 text-support-error">{validation.reason}</span>
            </>
          )}
        </p>
        <Button
          variant="secondary"
          size="small"
          loading={removeCoupon.isPending}
          onClick={() => {
            removeCoupon.mutate();
          }}
          icon={<Close size={16} />}
          aria-label={`Remove coupon ${appliedCode}`}
        >
          Remove
        </Button>
      </div>
    );
  }

  const submit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    applyCoupon.mutate(trimmed, {
      onSuccess: () => {
        setCode('');
      },
    });
  };

  return (
    <form onSubmit={submit} noValidate aria-label="Coupon">
      <div className="flex items-end gap-8">
        <div className="min-w-0 flex-1">
          <TextInput
            label="Coupon code"
            placeholder="Apply Coupon"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              if (applyCoupon.isError) applyCoupon.reset();
            }}
            autoComplete="off"
            className="bg-layer-2"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : undefined}
          />
        </div>
        <Button
          type="submit"
          loading={applyCoupon.isPending}
          disabled={!code.trim() || applyCoupon.isPending}
        >
          Apply
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-4 text-12 text-support-error">
          {error}
        </p>
      )}
    </form>
  );
}
