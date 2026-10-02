import { useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from '@carbon/icons-react';

export type SelectProps = {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({
  label,
  options,
  error,
  className,
  id: providedId,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={id} className="text-12 font-normal text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={cn(
            'h-48 w-full appearance-none rounded-none border-0 border-b bg-layer-1 px-16 pr-48 text-16 text-text-primary',
            'transition-colors',
            'focus:ring-2 focus:ring-focus focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-support-error' : 'border-border',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute top-1/2 right-16 -translate-y-1/2 text-text-secondary">
          <ChevronDown size={20} aria-hidden="true" />
        </div>
      </div>
      {error && (
        <p id={errorId} className="text-12 text-support-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
