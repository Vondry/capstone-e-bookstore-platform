/**
 * Header - menu, logo, nav links, cart and profile/account menu (wireframe 01, top bar)
 */

import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingCart } from '@carbon/icons-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { navLinks } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { AccountMenu } from './AccountMenu';

export type HeaderProps = {
  onMenuClick: () => void;
  menuExpanded: boolean;
  cartCount: number;
};

const iconButtonClass =
  'flex h-48 w-48 items-center justify-center text-text-primary transition-colors hover:bg-layer-2';

export function Header({ onMenuClick, menuExpanded, cartCount }: Readonly<HeaderProps>) {
  return (
    <header className="sticky top-0 z-40 flex h-48 items-center border-b border-border bg-bg">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Menu"
        aria-expanded={menuExpanded}
        className={iconButtonClass}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <Link
        to="/"
        className="flex h-48 items-center px-8 text-14 font-semibold text-text-primary md:pr-32"
      >
        Book Worm
      </Link>

      <nav aria-label="Main" className="hidden h-24 items-center border-l border-border md:flex">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex h-48 items-center px-16 text-14 text-text-secondary transition-colors hover:text-text-primary',
                isActive && 'text-text-primary'
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center">
        <ThemeToggle />
        <Link
          to="/checkout"
          aria-label={`Shopping cart, ${String(cartCount)} ${cartCount === 1 ? 'item' : 'items'}`}
          className={cn(iconButtonClass, 'relative')}
        >
          <ShoppingCart size={20} aria-hidden="true" />
          {cartCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-4 right-8 flex h-16 min-w-[16px] items-center justify-center rounded-full bg-support-error px-4 text-12 leading-none text-white"
            >
              {cartCount}
            </span>
          )}
        </Link>
        <span className="sr-only" aria-live="polite">
          {`${String(cartCount)} ${cartCount === 1 ? 'item' : 'items'} in cart`}
        </span>
        <AccountMenu triggerClassName={iconButtonClass} />
      </div>
    </header>
  );
}
