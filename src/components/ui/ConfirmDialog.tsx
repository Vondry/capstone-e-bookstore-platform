/**
 * ConfirmDialog - modal confirmation for destructive actions
 * (S4 remove item at quantity 0, S7 cancel order)
 */

import { useEffect, useEffectEvent, useId, useRef } from 'react';
import { Button } from './Button';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Where focus goes when the element that opened the dialog is gone (e.g. a removed cart line) */
function focusFallback() {
  const main = document.getElementById('main');
  if (!main) return;
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  main.focus();
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancel = useEffectEvent(onCancel);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Focus the safe choice first
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancel();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      // Keep Tab inside the modal
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])')
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
      else focusFallback();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-16">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative w-full max-w-[480px] bg-layer-1 shadow-lg"
      >
        <div className="p-16">
          <h2 id={titleId} className="text-20 text-text-primary">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="mt-8 text-14 text-text-secondary">
              {description}
            </p>
          )}
        </div>
        <div className="mt-24 grid grid-cols-2">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} className="w-full">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            loading={loading}
            className="w-full bg-support-error hover:bg-support-error"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
