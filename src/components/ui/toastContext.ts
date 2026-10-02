import { createContext, useContext } from 'react';

export type ToastKind = 'success' | 'error';

export type ToastContextValue = {
  showToast: (message: string, kind?: ToastKind) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

/** Shows a short notification, e.g. after "Add to Cart" or "Buy it again" */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
