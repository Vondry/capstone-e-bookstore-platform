import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPublisher } from "../../../utils/brands"

/** GET /store/publishers/{slug} (docs/api/openapi.yaml → getPublisher) */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ publisher: await getPublisher(req.scope, req.params.slug) })
}
