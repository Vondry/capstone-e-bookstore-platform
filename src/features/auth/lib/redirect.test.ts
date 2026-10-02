import { describe, expect, it } from 'vitest';
import { DEFAULT_REDIRECT, safeRedirect, withRedirect } from './redirect';

describe('safeRedirect', () => {
  it.each([
    '/',
    '/orders',
    '/orders?x=1',
    '/books/godaan#reviews',
    '/category/romance?sort=price-asc',
  ])('accepts the in-app path %s', (target) => {
    expect(safeRedirect(target)).toBe(target);
  });

  it.each([
    null,
    undefined,
    '',
    'orders',
    '//evil.com',
    '//evil.com/path',
    '/\\evil.com',
    '/foo\\bar',
    'https://evil.com',
    'http://localhost:5173/orders',
    'javascript:alert(1)',
    '/\tevil',
    '/login',
    '/login?redirect=/orders',
    '/register',
  ])('falls back to "/" for %s', (target) => {
    expect(safeRedirect(target)).toBe(DEFAULT_REDIRECT);
  });
});

describe('withRedirect', () => {
  it('adds an encoded redirect param', () => {
    expect(withRedirect('/login', '/orders?x=1')).toBe('/login?redirect=%2Forders%3Fx%3D1');
  });

  it('omits the param for the home page and unsafe targets', () => {
    expect(withRedirect('/login', '/')).toBe('/login');
    expect(withRedirect('/register', '//evil.com')).toBe('/register');
    expect(withRedirect('/login', '/login')).toBe('/login');
  });
});
