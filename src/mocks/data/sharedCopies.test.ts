import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const MARKER = '// ---- copied from shared/catalog/artwork.ts ----\n';

describe('backend copies of shared code', () => {
  it('backend/apps/backend/src/lib/artwork.ts matches shared/catalog/artwork.ts', () => {
    const shared = readFileSync('shared/catalog/artwork.ts', 'utf8');
    const copy = readFileSync('backend/apps/backend/src/lib/artwork.ts', 'utf8');
    expect(copy.split(MARKER)[1]).toBe(shared);
  });
});
