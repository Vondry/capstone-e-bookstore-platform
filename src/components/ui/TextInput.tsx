import { useId } from 'react';
import { cn } from '@/lib/utils';

export type TextInputProps = {
  label: string;
  error?: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput({
  label,
  error,
  icon,
  className,
  id: providedId,
  ...props
}: TextInputProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={id} className="text-12 font-normal text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={cn(
            'h-48 w-full rounded-none border-0 border-b bg-layer-1 px-16 text-16 text-text-primary',
            'placeholder:text-text-placeholder',
            'transition-colors',
            'focus:ring-2 focus:ring-focus focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-support-error' : 'border-border',
            icon && 'pr-48',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {icon && (
          <div className="absolute top-1/2 right-16 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-12 text-support-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
