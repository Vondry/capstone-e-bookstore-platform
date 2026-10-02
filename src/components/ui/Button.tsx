import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';
import { CircleDash } from '@carbon/icons-react';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  /** React 19: ref is a regular prop and is forwarded to the <button> */
  ref?: React.Ref<HTMLButtonElement>;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  icon,
  iconPosition = 'right',
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || loading;

  return (
    <button
      type="button"
      className={buttonClasses({ variant, size, className })}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      <span className="flex items-center gap-8">
        {loading && <CircleDash size={20} className="animate-spin" aria-hidden="true" />}
        {!loading && icon && iconPosition === 'left' && <span aria-hidden="true">{icon}</span>}
        {children}
      </span>
      {!loading && icon && iconPosition === 'right' && <span aria-hidden="true">{icon}</span>}
    </button>
  );
}
