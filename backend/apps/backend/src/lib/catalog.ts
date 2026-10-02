/**
 * Loads the seed catalogue from the repo's shared/catalog folder, so the backend seeds exactly
 * the books the frontend mocks serve (plan 14). JSON is read at runtime because Medusa only
 * compiles files inside apps/backend.
 */

import fs from "node:fs"
import { MedusaError } from "@medusajs/framework/utils"
import path from "node:path"

export type SeedFormat = "Paperback" | "Hardcover" | "eBook"

export type SeedBook = {
  handle: string
  title: string
  subtitle?: string
  author: string
  publisher: string | null
  description: string
  format: SeedFormat
  language: string
  categories: string[]
  priceInr: number
  rating: number | null
  soldCount: number | null
  isNewLaunch: boolean
  cover: [string, string]
}

export type SeedCategory = { handle: string; name: string }
export type SeedWriter = { slug: string; name: string; bio: string[] }
export type SeedPublisher = { slug: string; name: string; description: string }

export type SeedAddress = {
  firstName: string
  lastName: string
  address: string
  email: string
  city: string
  pin: string
  phoneCountryCode: string
  phone: string
  state: string
  country: string
}

export type SeedDemo = {
  customer: {
    email: string
    password: string
    firstName: string
    lastName: string
    giftPoints: number
  }
  address: SeedAddress
  orders: { displayId: number; hoursAgo: number; books: string[]; paymentMethod: string }[]
}

export type SharedCatalog = {
  books: SeedBook[]
  categories: SeedCategory[]
  writers: SeedWriter[]
  publishers: SeedPublisher[]
  demo: SeedDemo
}

/** Walks up from `start` to the folder that contains shared/catalog */
function findCatalogDir(start: string): string {
  let dir = start
  for (;;) {
    const candidate = path.join(dir, "shared", "catalog")
    if (fs.existsSync(path.join(candidate, "books.json"))) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `shared/catalog not found above ${start}; run from the Book Worm repo`
      )
    }
    dir = parent
  }
}

function readJson<T>(dir: string, file: string): T {
  return JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as T
}

export function loadSharedCatalog(start = process.cwd()): SharedCatalog {
  const dir = findCatalogDir(start)
  return {
    books: readJson<SeedBook[]>(dir, "books.json"),
    categories: readJson<SeedCategory[]>(dir, "categories.json"),
    writers: readJson<SeedWriter[]>(dir, "writers.json"),
    publishers: readJson<SeedPublisher[]>(dir, "publishers.json"),
    demo: readJson<SeedDemo>(dir, "demo.json"),
  }
}

/** S4 country labels ↔ ISO codes (same mapping as the frontend's checkout/mappers.ts) */
export const COUNTRY_CODES: Record<string, string> = {
  India: "in",
  Nepal: "np",
  Bhutan: "bt",
  "Sri Lanka": "lk",
}
