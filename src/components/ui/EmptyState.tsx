import { cn } from '@/lib/utils';

export type EmptyStateProps = {
  title: string;
  description?: string;
  /** Optional call to action, e.g. a Button or Link */
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: Readonly<EmptyStateProps>) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-layer-1 p-48 text-center',
        className
      )}
    >
      <p className="text-20 text-text-primary">{title}</p>
      {description && <p className="mt-8 text-14 text-text-secondary">{description}</p>}
      {action && <div className="mt-24">{action}</div>}
    </div>
  );
}
