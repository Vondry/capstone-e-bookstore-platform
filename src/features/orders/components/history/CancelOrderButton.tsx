import { useCallback, useState } from 'react';
import { Close } from '@carbon/icons-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/toastContext';
import { useRequestCancellation } from '../../hooks/useOrders';
import { formatCancelHint } from '../../lib/orderFormat';

export type CancelOrderButtonProps = {
  orderId: string;
  displayId: number;
  hoursLeft: number;
};

/**
 * SIMULATED: Medusa has no store-side cancel, so this sends a cancellation *request*.
 * Only rendered while the order is inside the 48 h window (see lib/cancelWindow).
 */
export function CancelOrderButton({
  orderId,
  displayId,
  hoursLeft,
}: Readonly<CancelOrderButtonProps>) {
  const [open, setOpen] = useState(false);
  const requestCancellation = useRequestCancellation();
  const { showToast } = useToast();
  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirm = () => {
    requestCancellation.mutate(orderId, {
      onSuccess: () => {
        setOpen(false);
        showToast(`Cancellation requested for order #${String(displayId)}`, 'success');
      },
      onError: (error) => {
        setOpen(false);
        showToast(
          error.message || 'Could not request the cancellation. Please try again.',
          'error'
        );
      },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-12">
      <p className="text-14 text-text-secondary">{formatCancelHint(hoursLeft)}</p>
      <Button
        variant="secondary"
        size="small"
        icon={<Close size={16} />}
        onClick={() => {
          setOpen(true);
        }}
      >
        Cancel order
      </Button>
      <ConfirmDialog
        open={open}
        title={`Cancel order #${String(displayId)}?`}
        description="This sends a cancellation request for the whole order. The store confirms it separately, so the order will show as “Cancellation requested” until then."
        confirmLabel="Request cancellation"
        cancelLabel="Keep order"
        loading={requestCancellation.isPending}
        onConfirm={handleConfirm}
        onCancel={close}
      />
    </div>
  );
}
