import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const links = [
  { to: '/writers', label: 'Writers' },
  { to: '/publishers', label: 'Publishers' },
];

/** Switch between the two brand lists (same selected style as the category sidebar) */
export function BrandNav() {
  return (
    <nav aria-label="Browse by" className="mb-24 flex border-b border-border">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end
          className={({ isActive }) =>
            cn(
              'flex min-h-[44px] items-center border-b-[3px] px-16 text-14 transition-colors hover:bg-layer-2',
              isActive
                ? 'border-interactive font-semibold text-text-primary'
                : 'border-transparent text-text-secondary'
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
