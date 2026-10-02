import type { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import type { Book } from '../../catalog/types';

/**
 * "Home / {top category} / {sub category}" as in the wireframe. The top category links to
 * its catalogue page; the most specific category is the last (current) crumb.
 * Books with one category show "Home / {category}"; books without any fall back to the title.
 */
export function buildProductBreadcrumb(book: Book): BreadcrumbItem[] {
  const [top, sub] = book.categories;
  const home: BreadcrumbItem = { label: 'Home', to: '/' };
  if (!top) return [home, { label: book.title }];
  if (!sub) return [home, { label: top.name }];
  return [home, { label: top.name, to: `/category/${top.handle}` }, { label: sub.name }];
}
