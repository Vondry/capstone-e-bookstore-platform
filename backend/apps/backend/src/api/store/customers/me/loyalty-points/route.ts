import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../../modules/loyalty"
import type LoyaltyModuleService from "../../../../../modules/loyalty/service"

/** GET /store/customers/me/loyalty-points (docs/api/openapi.yaml → getLoyaltyPoints) */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const loyalty: LoyaltyModuleService = req.scope.resolve(LOYALTY_MODULE)
  res.json({ points: await loyalty.getPoints(req.auth_context.actor_id) })
}
