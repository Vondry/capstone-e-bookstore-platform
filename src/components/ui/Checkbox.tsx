/**
 * Checkbox - native checkbox with a visible label and a 48 px touch target
 */

import { useId } from 'react';
import { cn } from '@/lib/utils';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  className,
}: Readonly<CheckboxProps>) {
  const id = useId();
  return (
    <div className={cn('flex min-h-48 items-center gap-8', className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
        className="h-16 w-16 shrink-0 cursor-pointer rounded-none accent-interactive focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:cursor-not-allowed"
      />
      <label
        htmlFor={id}
        className="flex min-h-48 cursor-pointer items-center text-14 text-text-primary"
      >
        {label}
      </label>
    </div>
  );
}
