import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'default' | 'small';

/** Carbon-style button classes shared by <Button> and <ButtonLink> */
export function buttonClasses({
  variant = 'primary',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  return cn(
    'inline-flex items-center justify-between gap-8 rounded-none px-16 font-semibold transition-colors',
    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-focus',
    'disabled:cursor-not-allowed disabled:opacity-50',
    size === 'default' && 'h-48 text-16',
    size === 'small' && 'h-40 text-14',
    variant === 'primary' &&
      'bg-interactive text-white hover:bg-interactive-hover disabled:hover:bg-interactive',
    // Carbon secondary buttons keep white text in both themes
    variant === 'secondary' &&
      'bg-button-secondary text-white hover:bg-button-secondary-hover disabled:hover:bg-button-secondary',
    className
  );
}
