/**
 * RegisterPage - S1 `/register` (no wireframe: centred panel like S5, see docs/plans/09-s1-auth.md)
 */

import { Navigate } from 'react-router-dom';
import { AuthFooter } from '@/features/auth/components/AuthFooter';
import { AuthPanel } from '@/features/auth/components/AuthPanel';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { useAuthRedirect } from '@/features/auth/components/useAuthRedirect';
import { withRedirect } from '@/features/auth/lib/redirect';

export function RegisterPage() {
  const { target, isLoggedIn } = useAuthRedirect('Create account');

  if (isLoggedIn) return <Navigate to={target} replace />;

  return (
    <AuthPanel title="Create account">
      <RegisterForm redirectTo={target} />
      <AuthFooter
        prompt="Already have an account?"
        switchLabel="Log in"
        switchTo={withRedirect('/login', target)}
        guestTo={target}
      />
    </AuthPanel>
  );
}
