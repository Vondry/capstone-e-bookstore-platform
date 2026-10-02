import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listPublishers } from "../../utils/brands"

/** GET /store/publishers (docs/api/openapi.yaml → listPublishers) */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ publishers: await listPublishers(req.scope) })
}
