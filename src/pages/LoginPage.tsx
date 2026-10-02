/**
 * LoginPage - S1 `/login` (no wireframe: centred panel like S5, see docs/plans/09-s1-auth.md)
 */

import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthFooter } from '@/features/auth/components/AuthFooter';
import { AuthPanel } from '@/features/auth/components/AuthPanel';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuthRedirect } from '@/features/auth/components/useAuthRedirect';
import { withRedirect } from '@/features/auth/lib/redirect';

export function LoginPage() {
  const { target, isLoggedIn } = useAuthRedirect('Log in');

  // Set title immediately, before any redirect
  useEffect(() => {
    document.title = 'Log in · Book Worm';
  }, []);

  if (isLoggedIn) return <Navigate to={target} replace />;

  return (
    <AuthPanel title="Log in">
      <LoginForm redirectTo={target} />
      {import.meta.env.DEV && (
        <p className="text-12 text-text-secondary">Demo: reader@bookworm.test / bookworm123</p>
      )}
      <AuthFooter
        prompt="New to Book Worm?"
        switchLabel="Create an account"
        switchTo={withRedirect('/register', target)}
        guestTo={target}
      />
    </AuthPanel>
  );
}
