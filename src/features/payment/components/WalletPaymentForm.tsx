import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select } from '@/components/ui/Select';
import { WALLETS, walletSchema, type WalletFormValues } from '../lib/schemas';
import type { PaymentError } from '../hooks/usePayment';
import type { PaymentSubmission } from '../types';
import { PaymentFooter } from './PaymentFooter';

export type WalletPaymentFormProps = {
  onPay: (submission: PaymentSubmission) => Promise<boolean>;
  error: PaymentError | null;
  processing: boolean;
};

const WALLET_OPTIONS = [{ value: '', label: 'Choose a wallet' }, ...WALLETS];

export function WalletPaymentForm({ onPay, error, processing }: Readonly<WalletPaymentFormProps>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (details) => {
    await onPay({ method: 'wallet', details });
  });

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} aria-label="Wallet details">
      <Select
        label="Wallet"
        options={WALLET_OPTIONS}
        error={errors.wallet?.message}
        {...register('wallet')}
      />
      <PaymentFooter
        error={error}
        canPay={isValid && !isSubmitting}
        processing={processing || isSubmitting}
      />
    </form>
  );
}
