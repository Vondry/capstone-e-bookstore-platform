import { Link, type LinkProps } from 'react-router-dom';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles';

export type ButtonLinkProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Carbon style: icon on the right */
  icon?: React.ReactNode;
} & LinkProps;

/** A navigation link that looks like a <Button> (CTAs such as "Continue your Shopping") */
export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      <span>{children}</span>
      {icon && <span aria-hidden="true">{icon}</span>}
    </Link>
  );
}
