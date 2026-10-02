/**
 * CategorySidebar - "All" plus the 19 genres (wireframe 01, left column)
 */

import { Link, useMatch, useSearchParams } from 'react-router-dom';
import { ALL_CATEGORY, categories } from '@/lib/categories';
import { cn } from '@/lib/utils';

export type CategorySidebarProps = {
  /** Called after a category is chosen, e.g. to close the mobile drawer */
  onNavigate?: () => void;
  className?: string;
};

export function CategorySidebar({ onNavigate, className }: Readonly<CategorySidebarProps>) {
  const categoryMatch = useMatch('/category/:handle');
  const [searchParams] = useSearchParams();
  const selected =
    categoryMatch?.params.handle ?? searchParams.get('category') ?? ALL_CATEGORY.handle;

  return (
    <nav aria-label="Categories" className={className}>
      <ul className="flex flex-col">
        {[ALL_CATEGORY, ...categories].map((category) => {
          const isSelected = category.handle === selected;
          return (
            <li key={category.handle}>
              <Link
                to={category.handle === ALL_CATEGORY.handle ? '/' : `/category/${category.handle}`}
                aria-current={isSelected ? 'page' : undefined}
                onClick={onNavigate}
                className={cn(
                  'flex min-h-[44px] items-center border-l-[3px] px-12 text-14 font-semibold text-text-primary transition-colors hover:bg-layer-2 lg:min-h-[32px]',
                  isSelected ? 'border-interactive bg-layer-2' : 'border-transparent'
                )}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
