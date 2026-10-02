import { ButtonLink } from '@/components/ui/ButtonLink';
import { Login } from '@carbon/icons-react';

/** Shown instead of the order list when nobody is logged in */
export function GuestPrompt() {
  return (
    <div className="flex flex-col items-center justify-center bg-layer-1 p-48 text-center">
      <p className="text-20 text-text-primary">Log in to see your orders</p>
      <p className="mt-8 text-14 text-text-secondary">
        Your order history, Buy it again and order cancellation are available once you log in.
      </p>
      <ButtonLink to="/login?redirect=/orders" className="mt-24 gap-24" icon={<Login size={20} />}>
        Log in
      </ButtonLink>
    </div>
  );
}
