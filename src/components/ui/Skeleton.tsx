import { cn } from '@/lib/utils';

export type SkeletonProps = {
  className?: string;
};

/** A pulsing placeholder block; size it with className to match the final layout */
export function Skeleton({ className }: Readonly<SkeletonProps>) {
  return <div aria-hidden="true" className={cn('animate-pulse bg-layer-2', className)} />;
}
