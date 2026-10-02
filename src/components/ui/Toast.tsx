import { useCallback, useMemo, useRef, useState } from 'react';
import { CheckmarkFilled, Close, ErrorFilled } from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { ToastContext, type ToastKind } from './toastContext';

type Toast = { id: number; message: string; kind: ToastKind };

const TOAST_DURATION_MS = 4000;

export type ToastProviderProps = {
  children: React.ReactNode;
};

export function ToastProvider({ children }: Readonly<ToastProviderProps>) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, kind }]);
      setTimeout(() => {
        dismiss(id);
      }, TOAST_DURATION_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-16 bottom-16 z-50 flex w-[calc(100%-2rem)] max-w-[400px] flex-col gap-8"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-center gap-12 border-l-[3px] bg-layer-2 py-12 pl-16 text-14 text-text-primary shadow-lg',
              toast.kind === 'success' ? 'border-support-success' : 'border-support-error'
            )}
          >
            {toast.kind === 'success' ? (
              <CheckmarkFilled
                size={20}
                className="shrink-0 text-support-success"
                aria-hidden="true"
              />
            ) : (
              <ErrorFilled size={20} className="shrink-0 text-support-error" aria-hidden="true" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => {
                dismiss(toast.id);
              }}
              className="flex h-40 w-40 shrink-0 items-center justify-center hover:bg-layer-1"
            >
              <Close size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
