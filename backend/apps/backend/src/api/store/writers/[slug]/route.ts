import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getWriter } from "../../../utils/brands"

/** GET /store/writers/{slug} (docs/api/openapi.yaml → getWriter) */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ writer: await getWriter(req.scope, req.params.slug) })
}
