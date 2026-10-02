import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const DAY_MS = 24 * 60 * 60 * 1000
const RECENT_DAYS = 30

type ProductRow = { id: string; metadata: Record<string, unknown> | null }
type OrderRow = { items: { product_id: string | null; quantity: number }[] | null }

/**
 * GET /store/catalog/bestsellers?limit=3 (docs/api/openapi.yaml → listBestsellers).
 * Ranked by copies sold in the last 30 days, then by the seeded `sold_count`.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 3) || 3, 1), 20)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const since = new Date(Date.now() - RECENT_DAYS * DAY_MS)

  const [{ data: products }, { data: orders }] = await Promise.all([
    query.graph({
      entity: "product",
      fields: ["id", "metadata"],
      filters: { status: "published" },
    }),
    query.graph({
      entity: "order",
      fields: ["items.product_id", "items.quantity"],
      filters: { created_at: { $gte: since } },
    }),
  ])

  const recent = new Map<string, number>()
  for (const item of (orders as OrderRow[]).flatMap((order) => order.items ?? [])) {
    if (item.product_id) {
      recent.set(item.product_id, (recent.get(item.product_id) ?? 0) + Number(item.quantity))
    }
  }
  const soldCount = (product: ProductRow) => Number(product.metadata?.sold_count ?? 0)

  const productIds = (products as ProductRow[])
    .sort(
      (a, b) => (recent.get(b.id) ?? 0) - (recent.get(a.id) ?? 0) || soldCount(b) - soldCount(a)
    )
    .slice(0, limit)
    .map((product) => product.id)

  res.json({ product_ids: productIds })
}
