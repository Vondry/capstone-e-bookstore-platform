import { Renew } from '@carbon/icons-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export type ErrorStateProps = {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
  className,
}: Readonly<ErrorStateProps>) {
  const message = error instanceof Error ? error.message : undefined;
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center bg-layer-1 p-48 text-center',
        className
      )}
    >
      <p className="text-20 text-support-error">{title}</p>
      {message && <p className="mt-8 text-14 text-text-secondary">{message}</p>}
      {onRetry && (
        <Button className="mt-24" onClick={onRetry} icon={<Renew size={20} />}>
          Try again
        </Button>
      )}
    </div>
  );
}
