import { useEffect, useRef } from 'react';
import { Purchase, WarningFilled } from '@carbon/icons-react';
import { Button } from '@/components/ui/Button';
import type { PaymentError } from '../hooks/usePayment';

export type PaymentFooterProps = {
  error: PaymentError | null;
  canPay: boolean;
  processing: boolean;
};

/** Inline payment error (focused on failure) and the Pay Now submit button */
export function PaymentFooter({ error, canPay, processing }: Readonly<PaymentFooterProps>) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) alertRef.current?.focus();
  }, [error]);

  return (
    <div className="mt-24 flex flex-col gap-16">
      {error && (
        <div
          ref={alertRef}
          role="alert"
          tabIndex={-1}
          className="flex items-start gap-8 border-l-[3px] border-support-error bg-layer-2 p-12 text-14 text-text-primary focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden"
        >
          <WarningFilled
            size={16}
            className="mt-2 shrink-0 text-support-error"
            aria-hidden="true"
          />
          <span>{error.message}</span>
        </div>
      )}
      <Button
        type="submit"
        className="w-full md:ml-auto md:w-auto md:min-w-[160px]"
        icon={<Purchase size={20} />}
        loading={processing}
        disabled={!canPay || processing}
      >
        {processing ? 'Processing payment…' : 'Pay Now'}
      </Button>
    </div>
  );
}
