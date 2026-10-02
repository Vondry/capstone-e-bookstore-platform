import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompleteCart } from '../../cart/hooks/useCart';
import { simulatePaymentOutcome } from '../lib/simulateOutcome';
import type { PaymentSubmission } from '../types';

export type PaymentError = {
  message: string;
  /** Increments on every failure so the alert re-focuses even when the message repeats */
  attempt: number;
};

const FALLBACK_ERROR = 'Payment could not be completed. Please try again.';

/**
 * Runs a payment: SIMULATED authorisation first, then completes the cart with the method only.
 * Card details are never passed to the API, logged or stored.
 */
export function usePayment() {
  const navigate = useNavigate();
  const completeCart = useCompleteCart();
  const inFlight = useRef(false);
  const [error, setError] = useState<PaymentError | null>(null);

  const fail = (message: string) => {
    setError((previous) => ({ message, attempt: (previous?.attempt ?? 0) + 1 }));
  };

  const { mutateAsync } = completeCart;
  const pay = useCallback(
    async (submission: PaymentSubmission): Promise<boolean> => {
      // Double-submit guard: synchronous, so a second click in the same tick is ignored
      if (inFlight.current) return false;
      inFlight.current = true;
      try {
        // SIMULATED: decided client-side; declined cards never reach the API
        const outcome = simulatePaymentOutcome(submission);
        if (!outcome.ok) {
          fail(outcome.message);
          return false;
        }
        const order = await mutateAsync(submission.method);
        void navigate(`/orders/${order.id}/success`, { replace: true });
        return true;
      } catch (caught: unknown) {
        fail(caught instanceof Error && caught.message ? caught.message : FALLBACK_ERROR);
        return false;
      } finally {
        inFlight.current = false;
      }
    },
    [mutateAsync, navigate]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    pay,
    error,
    clearError,
    isProcessing: completeCart.isPending,
    isComplete: completeCart.isSuccess,
  };
}
