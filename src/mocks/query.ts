/**
 * Reads query parameters the way the Medusa SDK writes them (`qs`: arrays as `id[0]=a&id[1]=b`).
 */

/** All values of `name`, whether sent as `name=`, `name[]=` or `name[0]=` */
export function queryValues(url: URL, name: string): string[] {
  const pattern = new RegExp(`^${name}(\\[\\d*\\])?$`);
  return [...url.searchParams.entries()]
    .filter(([key]) => pattern.test(key))
    .map(([, value]) => value);
}

export function queryNumber(url: URL, name: string, fallback: number): number {
  const value = Number(url.searchParams.get(name));
  return url.searchParams.has(name) && Number.isFinite(value) ? value : fallback;
}
