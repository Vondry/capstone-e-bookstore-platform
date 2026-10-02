import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { withRedirect } from '@/features/auth/lib/redirect';
import { Catalog, CheckmarkFilled } from '@carbon/icons-react';
import type { Order } from '../../types';
import { PurchasedBooks } from './PurchasedBooks';

export type PurchaseSuccessPanelProps = {
  order: Order;
  /** true only when we know the visitor is a guest (customer query resolved to null) */
  isGuest: boolean;
};

// Primary button look for a navigation link (Button renders a <button>)
export function PurchaseSuccessPanel({ order, isGuest }: Readonly<PurchaseSuccessPanelProps>) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation so screen readers announce it on arrival
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const points = order.pointsEarned;
  const pointsLabel = `${String(points)} gift ${points === 1 ? 'point' : 'points'}`;

  return (
    <section
      aria-labelledby="purchase-success-heading"
      className="mx-auto flex w-full max-w-[860px] flex-col items-center bg-layer-1 p-24 text-center md:p-32"
    >
      {/* Hero icon: 48 px on purpose (wireframe), larger than the usual 16/20 px icons */}
      <CheckmarkFilled size={48} aria-hidden="true" className="text-support-success" />

      <h1
        id="purchase-success-heading"
        ref={headingRef}
        tabIndex={-1}
        className="mt-24 max-w-[280px] text-20 text-text-primary focus:outline-hidden focus-visible:ring-0"
      >
        Your purchase of the following reads is successful
      </h1>

      <div className="mt-16 text-14">
        <p className="font-semibold text-text-primary">Order #{order.displayId}</p>
        {isGuest ? (
          // SIMULATED: only logged-in customers collect points (the mock credits the account)
          <p className="mt-4 text-text-secondary">
            This order would have earned {pointsLabel}.{' '}
            <Link
              to={withRedirect('/login', `/orders/${order.id}/success`)}
              className="text-link underline hover:text-interactive-hover"
            >
              Log in to collect points next time
            </Link>
          </p>
        ) : (
          <p className="mt-4 text-text-secondary">You earned {pointsLabel}</p>
        )}
      </div>

      <div className="mt-24 w-full">
        <PurchasedBooks lines={order.lines} orderedAt={order.createdAt} />
      </div>

      <ButtonLink to="/" className="mt-32 gap-32" icon={<Catalog size={20} />}>
        Continue your Shopping
      </ButtonLink>
    </section>
  );
}
