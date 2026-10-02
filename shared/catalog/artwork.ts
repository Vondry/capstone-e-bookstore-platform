/**
 * Generated artwork for the seed catalogue: SVG book covers and initials avatars as data URIs,
 * so neither the mocks nor the backend seed need image files.
 * Shared by the MSW mock backend (src/mocks) and the Medusa seed script (backend/).
 * Colours here are artwork, not UI colours, so they are not design tokens.
 */

/** A simple SVG book cover */
export function makeCover(
  title: string,
  author: string,
  background: string,
  foreground: string
): string {
  const words = title.toUpperCase().split(' ');
  const lines: string[] = [];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + word).length <= 11) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  const escape = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const titleText = lines
    .map(
      (line, i) =>
        `<text x="100" y="${String(60 + i * 34)}" text-anchor="middle" font-size="28" font-weight="700">${escape(line)}</text>`
    )
    .join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">` +
    `<rect width="200" height="300" fill="${background}"/>` +
    `<g fill="${foreground}" font-family="IBM Plex Sans, Arial, sans-serif">${titleText}` +
    `<circle cx="100" cy="${String(Math.max(170, 80 + lines.length * 34))}" r="22" fill="none" stroke="${foreground}" stroke-width="4"/>` +
    `<text x="100" y="278" text-anchor="middle" font-size="14" font-weight="600" letter-spacing="2">${escape(author.toUpperCase())}</text>` +
    `</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** An initials avatar */
export function makeAvatar(name: string): string {
  const initials = name
    .replace(/^Dr\.\s+/, '')
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">` +
    `<rect width="120" height="120" fill="#4589ff"/>` +
    `<text x="60" y="72" text-anchor="middle" font-family="IBM Plex Sans, Arial, sans-serif" font-size="40" font-weight="600" fill="#ffffff">${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
