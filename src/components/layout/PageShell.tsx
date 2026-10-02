/**
 * PageShell - Header on top, CategorySidebar (≥ lg) or Drawer (< lg) beside the page content
 */

import { useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RouteErrorBoundary } from '@/app/RouteErrorBoundary';
import { Drawer } from '@/components/ui/Drawer';
import { navLinks } from '@/lib/navigation';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { cn } from '@/lib/utils';
import { CategorySidebar } from './CategorySidebar';
import { useCartCount } from '@/features/cart/hooks/useCart';
import { Footer } from './Footer';
import { Header } from './Header';

const LG_QUERY = '(min-width: 1056px)';

export type PageShellProps = {
  children: React.ReactNode;
};

/** The category sidebar belongs to the catalogue (S2); other screens use the full width */
function isCatalogueRoute(pathname: string): boolean {
  return pathname === '/' || pathname.startsWith('/category/');
}

export function PageShell({ children }: Readonly<PageShellProps>) {
  const { pathname } = useLocation();
  const showSidebar = isCatalogueRoute(pathname);
  const cartCount = useCartCount();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery(LG_QUERY);

  // On the catalogue ≥ lg the menu icon shows/hides the sidebar; otherwise it opens the drawer.
  const handleMenuClick = () => {
    if (showSidebar && isDesktop) {
      setSidebarVisible((visible) => !visible);
    } else {
      setDrawerOpen(true);
    }
  };

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  // Keyed by route so navigating away from a crashed screen clears the error
  const content = <RouteErrorBoundary key={pathname}>{children}</RouteErrorBoundary>;

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text-primary">
      <Header
        onMenuClick={handleMenuClick}
        menuExpanded={drawerOpen || (showSidebar && sidebarVisible && isDesktop)}
        cartCount={cartCount}
      />

      {showSidebar ? (
        <div className="mx-auto flex w-full max-w-[1584px] flex-1">
          <CategorySidebar
            className={cn(
              'hidden w-[264px] shrink-0 py-16 lg:sticky lg:top-48 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto',
              sidebarVisible && 'lg:block'
            )}
          />

          <main id="main" className="min-w-0 flex-1 px-16 py-16 md:px-24">
            {content}
          </main>
        </div>
      ) : (
        // Pages lay out their own content (PageContainer or a full-bleed illustration)
        <main id="main" className="flex-1">
          {content}
        </main>
      )}

      <Footer />

      <Drawer open={drawerOpen} onClose={closeDrawer} title="Menu">
        <nav aria-label="Main" className="border-b border-border pb-8 md:hidden">
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={closeDrawer}
                  className="flex min-h-[44px] items-center px-16 text-14 text-text-primary hover:bg-layer-2"
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <CategorySidebar onNavigate={closeDrawer} className="pt-8" />
      </Drawer>
    </div>
  );
}
