/**
 * AuthFooter - S1 secondary links under the form: switch between login/register and continue as guest.
 * Links use --link and are underlined (02-design-system).
 */

import { Link } from 'react-router-dom';

export type AuthFooterProps = {
  prompt: string;
  switchLabel: string;
  switchTo: string;
  /** Where "Continue as guest" goes (the redirect target) */
  guestTo: string;
};

const linkClass =
  'text-link underline hover:no-underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus';

export function AuthFooter({ prompt, switchLabel, switchTo, guestTo }: Readonly<AuthFooterProps>) {
  return (
    <div className="flex flex-col gap-12 border-t border-border pt-16 text-14 text-text-secondary">
      <p>
        {prompt}{' '}
        <Link to={switchTo} className={linkClass}>
          {switchLabel}
        </Link>
      </p>
      <p>
        <Link to={guestTo} className={linkClass}>
          Continue as guest
        </Link>
      </p>
    </div>
  );
}
