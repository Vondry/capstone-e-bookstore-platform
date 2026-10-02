/**
 * Post-login redirect targets (S1). Pure, no React.
 * Only same-origin relative paths are allowed so `?redirect=` can't be used as an open redirect.
 */

export const DEFAULT_REDIRECT = '/';

const AUTH_PATHS = ['/login', '/register'];

function pathnameOf(target: string): string {
  return target.split(/[?#]/)[0] ?? target;
}

function hasControlChar(value: string): boolean {
  return Array.from(value).some((char) => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });
}

/** Returns `raw` when it is a safe in-app path ("/orders?x=1"), otherwise "/" */
export function safeRedirect(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_REDIRECT;
  // Must be a root-relative path, not protocol-relative ("//evil.com")
  if (!raw.startsWith('/') || raw.startsWith('//')) return DEFAULT_REDIRECT;
  // Browsers treat "\" as "/" ("/\evil.com" → "//evil.com"); control chars can hide either
  if (raw.includes('\\') || hasControlChar(raw)) return DEFAULT_REDIRECT;
  // Never bounce back to the auth screens themselves
  if (AUTH_PATHS.includes(pathnameOf(raw))) return DEFAULT_REDIRECT;
  return raw;
}

/** Builds e.g. "/login?redirect=%2Forders" — omits the param when it would just be "/" */
export function withRedirect(authPath: string, target: string): string {
  const safe = safeRedirect(target);
  if (safe === DEFAULT_REDIRECT) return authPath;
  return `${authPath}?${new URLSearchParams({ redirect: safe }).toString()}`;
}
