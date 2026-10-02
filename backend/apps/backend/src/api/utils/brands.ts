import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

type Linked = { products?: { id: string }[] | null }
type WriterRow = Linked & { slug: string; name: string; bio: string[] | null; avatar_url: string }
type PublisherRow = Linked & { slug: string; name: string; description: string }

const productIds = (row: Linked) => (row.products ?? []).map((product) => product.id)

export async function listWriters(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "writer",
    fields: ["slug", "name", "avatar_url", "products.id"],
  })
  return (data as WriterRow[])
    .map((writer) => ({
      slug: writer.slug,
      name: writer.name,
      avatar_url: writer.avatar_url,
      book_count: productIds(writer).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getWriter(container: MedusaContainer, slug: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [writer],
  } = await query.graph({
    entity: "writer",
    fields: ["slug", "name", "bio", "avatar_url", "products.id"],
    filters: { slug },
  })
  const row = writer as WriterRow | undefined
  if (!row) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Writer not found")
  return {
    slug: row.slug,
    name: row.name,
    bio: row.bio ?? [],
    avatar_url: row.avatar_url,
    product_ids: productIds(row),
  }
}

export async function listPublishers(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "publisher",
    fields: ["slug", "name", "description", "products.id"],
  })
  return (data as PublisherRow[])
    .map((publisher) => ({
      slug: publisher.slug,
      name: publisher.name,
      description: publisher.description,
      book_count: productIds(publisher).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getPublisher(container: MedusaContainer, slug: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [publisher],
  } = await query.graph({
    entity: "publisher",
    fields: ["slug", "name", "description", "products.id"],
    filters: { slug },
  })
  const row = publisher as PublisherRow | undefined
  if (!row) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Publisher not found")
  const ids = productIds(row)
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    book_count: ids.length,
    product_ids: ids,
  }
}
