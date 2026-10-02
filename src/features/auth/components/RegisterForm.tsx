/**
 * RegisterForm - S1 create-account form (React Hook Form + Zod)
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from '@carbon/icons-react';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { useToast } from '@/components/ui/toastContext';
import { useRegister } from '../hooks/useCustomer';
import { authErrorMessage } from '../lib/errors';
import { PASSWORD_MIN, registerSchema, type RegisterValues } from '../lib/schemas';
import { FormAlert } from './FormAlert';
import { PasswordInput } from './PasswordInput';

export type RegisterFormProps = {
  /** Safe in-app path to open after the account is created */
  redirectTo: string;
};

export function RegisterForm({ redirectTo }: Readonly<RegisterFormProps>) {
  const registerCustomer = useRegister();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const customer = await registerCustomer.mutateAsync(values);
      showToast(`Welcome to Book Worm, ${customer.firstName}`);
      void navigate(redirectTo, { replace: true });
    } catch {
      // The error is rendered from `registerCustomer.error` below
    }
  });

  const serverError = registerCustomer.isError
    ? authErrorMessage(registerCustomer.error, 'register')
    : null;
  const busy = isSubmitting || registerCustomer.isPending;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-16">
      <div className="grid gap-16 md:grid-cols-2">
        <TextInput
          label="First name"
          autoComplete="given-name"
          className="bg-layer-2"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <TextInput
          label="Last name"
          autoComplete="family-name"
          className="bg-layer-2"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
      <TextInput
        label="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        className="bg-layer-2"
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordInput
        label="Password"
        autoComplete="new-password"
        helperText={`At least ${String(PASSWORD_MIN)} characters`}
        className="bg-layer-2"
        error={errors.password?.message}
        {...register('password')}
      />
      <FormAlert message={serverError} />
      <Button type="submit" loading={busy} icon={<ArrowRight size={20} />} className="w-full">
        {busy ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
