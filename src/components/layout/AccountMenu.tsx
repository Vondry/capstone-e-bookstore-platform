/**
 * AccountMenu - header profile icon (S1).
 * Guest: a link to /login?redirect=<current page>. Logged in: a menu button with
 * "Signed in as …", My Orders and Log out (bg-layer-1, square; shadow allowed on overlays).
 */

import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserAvatar } from '@carbon/icons-react';
import { useToast } from '@/components/ui/toastContext';
import { useCustomer, useLogout } from '@/features/auth/hooks/useCustomer';
import { withRedirect } from '@/features/auth/lib/redirect';
import { cn } from '@/lib/utils';

export type AccountMenuProps = {
  /** Classes for the 48×48 icon trigger, shared with the other header icons */
  triggerClassName: string;
};

const itemClass =
  'flex h-48 w-full items-center px-16 text-left text-14 text-text-primary transition-colors hover:bg-layer-2 focus:bg-layer-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus';

/** Index of the item to focus after an arrow/Home/End key, wrapping around; null for other keys */
function nextIndex(key: string, current: number, count: number): number | null {
  if (key === 'ArrowDown') return (current + 1) % count;
  if (key === 'ArrowUp') return (current - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}

export function AccountMenu({ triggerClassName }: Readonly<AccountMenuProps>) {
  const { data: customer } = useCustomer();
  const { pathname, search } = useLocation();

  if (!customer) {
    return (
      <Link
        to={withRedirect('/login', `${pathname}${search}`)}
        aria-label="Profile"
        className={triggerClassName}
      >
        <UserAvatar size={20} aria-hidden="true" />
      </Link>
    );
  }

  return <SignedInMenu firstName={customer.firstName} triggerClassName={triggerClassName} />;
}

type SignedInMenuProps = AccountMenuProps & { firstName: string };

function SignedInMenu({ firstName, triggerClassName }: Readonly<SignedInMenuProps>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const logout = useLogout();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  // Focus the first item on open; close on a click outside
  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    const list = items();
    const next = nextIndex(
      event.key,
      list.indexOf(document.activeElement as HTMLElement),
      list.length
    );
    if (next === null) return;
    event.preventDefault();
    list[next]?.focus();
  };

  const handleLogout = () => {
    logout();
    close(false);
    showToast("You're logged out");
    void navigate('/');
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (open && !containerRef.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label="Profile"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(triggerClassName, open && 'bg-layer-2')}
      >
        <UserAvatar size={20} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute top-48 right-0 z-50 w-[240px] border border-border bg-layer-1 shadow-lg">
          <p className="truncate border-b border-border px-16 py-12 text-12 text-text-secondary">
            Signed in as <span className="font-semibold text-text-primary">{firstName}</span>
          </p>
          <div id={menuId} ref={menuRef} role="menu" aria-label="Account" onKeyDown={onMenuKeyDown}>
            <Link
              to="/orders"
              role="menuitem"
              tabIndex={-1}
              className={itemClass}
              onClick={() => {
                close(false);
              }}
            >
              My Orders
            </Link>
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={itemClass}
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
