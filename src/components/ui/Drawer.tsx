/**
 * Drawer - slide-in panel from the left with an overlay (used for categories < lg)
 */

import { useEffect, useId, useRef } from 'react';
import { Close } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function Drawer({ open, onClose, title, children }: Readonly<DrawerProps>) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className={cn('fixed inset-0 z-50', !open && 'pointer-events-none')} aria-hidden={!open}>
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open}
        className={cn(
          'absolute inset-y-0 left-0 flex w-4/5 max-w-[320px] flex-col bg-bg shadow-lg transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-48 items-center justify-between border-b border-border pl-16">
          <h2 id={titleId} className="text-16 font-semibold text-text-primary">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={`Close ${title.toLowerCase()}`}
            className="flex h-48 w-48 items-center justify-center text-text-primary hover:bg-layer-2"
          >
            <Close size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-8">{children}</div>
      </div>
    </div>
  );
}
