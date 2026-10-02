/**
 * Breadcrumb for the checkout page, derived from the first cart line
 * (wireframe: Home / Non-Fiction / Self Help / Joy of Minimalism / Checkout)
 */

import type { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import type { Cart } from '../../cart/types';

export function buildCheckoutBreadcrumb(cart: Cart | null | undefined): BreadcrumbItem[] {
  const firstBook = cart?.lines[0]?.book;
  const trail: BreadcrumbItem[] = firstBook
    ? [
        ...firstBook.categories.map((category) => ({
          label: category.name,
          to: `/category/${category.handle}`,
        })),
        { label: firstBook.title, to: `/books/${firstBook.handle}` },
      ]
    : [];
  return [{ label: 'Home', to: '/' }, ...trail, { label: 'Checkout' }];
}
