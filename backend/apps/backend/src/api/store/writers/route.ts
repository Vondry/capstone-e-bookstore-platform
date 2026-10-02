import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listWriters } from "../../utils/brands"

/** GET /store/writers (docs/api/openapi.yaml → listWriters) */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ writers: await listWriters(req.scope) })
}
