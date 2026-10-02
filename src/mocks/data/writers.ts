/**
 * Mock writer profiles for "About the writer" (S3) and brand browsing, from the shared seed.
 * SIMULATED: served by the mock of the custom Brands routes (docs/api/openapi.yaml).
 */

import { makeAvatar, seedWriters } from '@shared/catalog';
import type { Writer } from '../../features/product/types';

export const mockWriters: Writer[] = seedWriters.map(({ slug, name, bio }) => ({
  slug,
  name,
  bio,
  avatarUrl: makeAvatar(name),
}));

export function findWriter(slug: string): Writer | undefined {
  return mockWriters.find((writer) => writer.slug === slug);
}
