import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from '@/components/ui/TextInput';
import { formatCardNumber, formatCvv, formatExpiry } from '../lib/cardFormat';
import { cardSchema, type CardFormValues } from '../lib/schemas';
import type { PaymentError } from '../hooks/usePayment';
import type { PaymentSubmission } from '../types';
import { PaymentFooter } from './PaymentFooter';

type CardMethod = Extract<PaymentSubmission['method'], 'credit-card' | 'debit-card'>;

export type CardPaymentFormProps = {
  method: CardMethod;
  onPay: (submission: PaymentSubmission) => Promise<boolean>;
  error: PaymentError | null;
  processing: boolean;
};

type FormatField = 'cardNumber' | 'cvv' | 'expiry';

const FORMATTERS: Record<FormatField, (value: string) => string> = {
  cardNumber: formatCardNumber,
  cvv: formatCvv,
  expiry: formatExpiry,
};

/** Credit / debit card form. Values stay in this component's memory only. */
export function CardPaymentForm({
  method,
  onPay,
  error,
  processing,
}: Readonly<CardPaymentFormProps>) {
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    mode: 'onTouched',
    defaultValues: { cardNumber: '', nameOnCard: '', cvv: '', expiry: '' },
  });

  /** Applies the input mask before React Hook Form reads the value */
  const masked = (name: FormatField) => {
    const field = register(name);
    return {
      ...field,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        event.target.value = FORMATTERS[name](event.target.value);
        return field.onChange(event);
      },
    };
  };

  const onSubmit = handleSubmit(async (details) => {
    const paid = await onPay({ method, details });
    // Keep everything except the CVV after a failure
    if (!paid) resetField('cvv');
  });

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} aria-label="Card details">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
        <TextInput
          label="Card Number"
          placeholder="XXXX-XXXX-XXXX-XXXX"
          inputMode="numeric"
          autoComplete="cc-number"
          maxLength={19}
          error={errors.cardNumber?.message}
          {...masked('cardNumber')}
        />
        <TextInput
          label="Name on Card"
          placeholder="Name"
          autoComplete="cc-name"
          error={errors.nameOnCard?.message}
          {...register('nameOnCard')}
        />
        <TextInput
          label="CVV"
          type="password"
          placeholder="XXX"
          inputMode="numeric"
          autoComplete="cc-csc"
          maxLength={3}
          error={errors.cvv?.message}
          {...masked('cvv')}
        />
        <TextInput
          label="Date of Expiry"
          placeholder="MM/YYYY"
          inputMode="numeric"
          autoComplete="cc-exp"
          maxLength={7}
          error={errors.expiry?.message}
          {...masked('expiry')}
        />
      </div>
      <PaymentFooter
        error={error}
        canPay={isValid && !isSubmitting}
        processing={processing || isSubmitting}
      />
    </form>
  );
}
