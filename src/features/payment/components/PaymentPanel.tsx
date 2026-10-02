import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { formatCurrency } from '@/lib/formatters';
import type { PaymentMethod } from '../../checkout/types';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { usePayment } from '../hooks/usePayment';
import { PAYMENT_METHODS } from '../lib/methods';
import { CardPaymentForm } from './CardPaymentForm';
import { UpiPaymentForm } from './UpiPaymentForm';
import { WalletPaymentForm } from './WalletPaymentForm';

export type PaymentPanelProps = {
  total: number;
  payment: ReturnType<typeof usePayment>;
};

/** "Complete Payment" panel: amount, method tabs and the active method's form */
export function PaymentPanel({ total, payment }: Readonly<PaymentPanelProps>) {
  const [method, setMethod] = useState<PaymentMethod>('credit-card');
  const isMdUp = useMediaQuery('(min-width: 672px)');
  const { pay, error, clearError, isProcessing } = payment;
  const formProps = { onPay: pay, error, processing: isProcessing };

  const changeMethod = (next: PaymentMethod) => {
    setMethod(next);
    clearError();
  };

  return (
    <section aria-labelledby="payment-title" className="mx-auto w-full max-w-[650px] bg-layer-1">
      <header className="flex flex-wrap items-center justify-between gap-8 border-b border-border p-16">
        <h1 id="payment-title" className="text-20 text-text-primary">
          Complete Payment
        </h1>
        <p className="text-16 font-semibold text-text-primary md:text-20">
          Payable Amount: {formatCurrency(total, true)}
        </p>
      </header>
      <Tabs
        label="Payment method"
        tabs={PAYMENT_METHODS}
        value={method}
        onChange={changeMethod}
        orientation={isMdUp ? 'vertical' : 'horizontal'}
      >
        <div className="p-16">
          {(method === 'credit-card' || method === 'debit-card') && (
            <CardPaymentForm key={method} method={method} {...formProps} />
          )}
          {method === 'upi' && <UpiPaymentForm {...formProps} />}
          {method === 'wallet' && <WalletPaymentForm {...formProps} />}
        </div>
      </Tabs>
    </section>
  );
}
