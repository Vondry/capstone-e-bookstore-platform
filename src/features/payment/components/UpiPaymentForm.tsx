import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from '@/components/ui/TextInput';
import { upiSchema, type UpiFormValues } from '../lib/schemas';
import type { PaymentError } from '../hooks/usePayment';
import type { PaymentSubmission } from '../types';
import { PaymentFooter } from './PaymentFooter';

export type UpiPaymentFormProps = {
  onPay: (submission: PaymentSubmission) => Promise<boolean>;
  error: PaymentError | null;
  processing: boolean;
};

export function UpiPaymentForm({ onPay, error, processing }: Readonly<UpiPaymentFormProps>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UpiFormValues>({
    resolver: zodResolver(upiSchema),
    mode: 'onTouched',
    defaultValues: { upiId: '' },
  });

  const onSubmit = handleSubmit(async (details) => {
    await onPay({ method: 'upi', details });
  });

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} aria-label="UPI details">
      <TextInput
        label="UPI ID"
        placeholder="name@bank"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        error={errors.upiId?.message}
        {...register('upiId')}
      />
      <PaymentFooter
        error={error}
        canPay={isValid && !isSubmitting}
        processing={processing || isSubmitting}
      />
    </form>
  );
}
