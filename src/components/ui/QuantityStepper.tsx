/**
 * QuantityStepper - "1 | − | +" control under a cart line (S4)
 */

import { Add, Subtract } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

export type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  /** Item name used in the accessible labels, e.g. the book title */
  itemLabel: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
};

const stepButtonClass =
  'flex h-48 w-48 items-center justify-center text-text-primary transition-colors hover:bg-layer-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent';

export function QuantityStepper({
  value,
  onChange,
  itemLabel,
  min = 0,
  max = 10,
  disabled = false,
  className,
}: Readonly<QuantityStepperProps>) {
  return (
    <div
      role="group"
      aria-label={`Quantity for ${itemLabel}`}
      className={cn('inline-flex items-center border-b border-border', className)}
    >
      <output
        aria-live="polite"
        className="flex h-48 w-48 items-center justify-center text-14 text-text-primary"
      >
        {value}
      </output>
      <button
        type="button"
        className={stepButtonClass}
        onClick={() => {
          onChange(value - 1);
        }}
        disabled={disabled || value <= min}
        aria-label={`Decrease quantity of ${itemLabel}`}
      >
        <Subtract size={16} aria-hidden="true" />
      </button>
      <span aria-hidden="true" className="h-16 w-px bg-border" />
      <button
        type="button"
        className={stepButtonClass}
        onClick={() => {
          onChange(value + 1);
        }}
        disabled={disabled || value >= max}
        aria-label={`Increase quantity of ${itemLabel}`}
      >
        <Add size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
