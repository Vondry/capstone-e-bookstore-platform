/**
 * SIMULATED: Medusa store product and category routes, plus the custom bestsellers route
 * (docs/api/openapi.yaml). Responses use Medusa's DTO shapes; see src/mocks/medusa/products.ts.
 * Docs: https://docs.medusajs.com/api/store#products
 */

import { http, HttpResponse } from 'msw';
import type { HttpTypes } from '@medusajs/types';
import type { BestsellersResponse, BookProductDTO } from '../../lib/storeTypes';
import { mockCategories, mockProducts } from '../medusa/products';
import { queryNumber, queryValues } from '../query';

function matchesSearch(product: BookProductDTO, q: string): boolean {
  const needle = q.toLowerCase();
  return [product.title, product.description ?? '', product.writer?.name ?? ''].some((text) =>
    text.toLowerCase().includes(needle)
  );
}

function page<T>(items: T[], url: URL) {
  const offset = queryNumber(url, 'offset', 0);
  const limit = queryNumber(url, 'limit', 50);
  return { items: items.slice(offset, offset + limit), count: items.length, offset, limit };
}

export const bookHandlers = [
  // GET /store/products: q, handle, id, category_id, order, limit, offset (fields/region_id ignored)
  http.get('*/store/products', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const handles = queryValues(url, 'handle');
    const ids = queryValues(url, 'id');
    const categoryIds = queryValues(url, 'category_id');

    let products = mockProducts.filter(
      (product) =>
        (!q || matchesSearch(product, q)) &&
        (handles.length === 0 || handles.includes(product.handle)) &&
        (ids.length === 0 || ids.includes(product.id)) &&
        (categoryIds.length === 0 ||
          (product.categories ?? []).some((entry) => categoryIds.includes(entry.id)))
    );
    if (url.searchParams.get('order') === '-created_at') {
      products = [...products].sort((a, b) =>
        (b.created_at ?? '').localeCompare(a.created_at ?? '')
      );
    }

    const { items, ...pagination } = page(products, url);
    return HttpResponse.json({ products: items, ...pagination });
  }),

  http.get('*/store/product-categories', ({ request }) => {
    const url = new URL(request.url);
    const handles = queryValues(url, 'handle');
    const categories: HttpTypes.StoreProductCategory[] = mockCategories.filter(
      (entry) => handles.length === 0 || handles.includes(entry.handle)
    );
    const { items, ...pagination } = page(categories, url);
    return HttpResponse.json({ product_categories: items, ...pagination });
  }),

  // Custom route: ranked by copies sold (the backend also counts the last 30 days of orders)
  http.get('*/store/catalog/bestsellers', ({ request }) => {
    const limit = queryNumber(new URL(request.url), 'limit', 3);
    const soldCount = (product: BookProductDTO) => Number(product.metadata?.sold_count ?? 0);
    const body: BestsellersResponse = {
      product_ids: [...mockProducts]
        .sort((a, b) => soldCount(b) - soldCount(a))
        .slice(0, limit)
        .map((product) => product.id),
    };
    return HttpResponse.json(body);
  }),
];
