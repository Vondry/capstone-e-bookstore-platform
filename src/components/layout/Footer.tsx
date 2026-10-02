/**
 * Footer - not in the wireframes, so kept minimal (.bob/rules/03-screens.md)
 */

import { Link } from 'react-router-dom';

const footerLinks = [
  { to: '/', label: 'Catalogue' },
  { to: '/writers', label: 'Writers' },
  { to: '/publishers', label: 'Publishers' },
  { to: '/orders', label: 'My Orders' },
  { to: '/wishlist', label: 'My Wishlist' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto flex max-w-[1584px] flex-col gap-16 px-16 py-24 md:flex-row md:items-center md:justify-between md:px-24">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-24 gap-y-8 text-14">
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-text-secondary hover:text-text-primary hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-12 text-text-secondary">© {new Date().getFullYear()} Book Worm</p>
      </div>
    </footer>
  );
}
