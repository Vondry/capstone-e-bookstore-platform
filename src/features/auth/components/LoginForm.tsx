/**
 * LoginForm - S1 e-mail + password form (React Hook Form + Zod)
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from '@carbon/icons-react';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { useToast } from '@/components/ui/toastContext';
import { useLogin } from '../hooks/useCustomer';
import { authErrorMessage } from '../lib/errors';
import { loginSchema, type LoginValues } from '../lib/schemas';
import { FormAlert } from './FormAlert';
import { PasswordInput } from './PasswordInput';

export type LoginFormProps = {
  /** Safe in-app path to open after logging in */
  redirectTo: string;
};

export function LoginForm({ redirectTo }: Readonly<LoginFormProps>) {
  const login = useLogin();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const customer = await login.mutateAsync(values);
      showToast(`Welcome back, ${customer.firstName}`);
      void navigate(redirectTo, { replace: true });
    } catch {
      // The error is rendered from `login.error` below
    }
  });

  const serverError = login.isError ? authErrorMessage(login.error, 'login') : null;
  const busy = isSubmitting || login.isPending;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-16">
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
        autoComplete="current-password"
        className="bg-layer-2"
        error={errors.password?.message}
        {...register('password')}
      />
      <FormAlert message={serverError} />
      <Button type="submit" loading={busy} icon={<ArrowRight size={20} />} className="w-full">
        {busy ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  );
}
