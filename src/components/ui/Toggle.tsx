/**
 * Toggle - Carbon-style on/off switch (`role="switch"`)
 */

import { useId } from 'react';
import { cn } from '@/lib/utils';

export type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Extra line under the label, e.g. "Available: 120 points" */
  description?: string;
  disabled?: boolean;
  className?: string;
};

export function Toggle({
  label,
  checked,
  onChange,
  description,
  disabled = false,
  className,
}: Readonly<ToggleProps>) {
  const labelId = useId();
  const descriptionId = useId();
  return (
    <div className={cn('flex min-h-48 items-center justify-between gap-16', className)}>
      <div className="flex flex-col">
        <span id={labelId} className="text-14 font-semibold text-text-primary">
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="text-12 text-text-secondary">
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => {
          onChange(!checked);
        }}
        className="flex h-48 shrink-0 items-center px-4 focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          aria-hidden="true"
          className={cn(
            'relative inline-block h-24 w-48 rounded-full transition-colors',
            checked ? 'bg-support-success' : 'bg-button-secondary'
          )}
        >
          <span
            className={cn(
              'absolute top-[3px] left-4 h-[18px] w-[18px] rounded-full bg-white transition-transform',
              checked && 'translate-x-24'
            )}
          />
        </span>
      </button>
    </div>
  );
}
