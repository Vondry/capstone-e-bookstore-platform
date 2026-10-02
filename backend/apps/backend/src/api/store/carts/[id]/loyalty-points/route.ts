import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { refetchStorefrontCart } from "../../../../utils/cart"
import {
  applyLoyaltyOnCartWorkflow,
  removeLoyaltyFromCartWorkflow,
} from "../../../../../workflows/loyalty"

/** POST /store/carts/{id}/loyalty-points: redeem gift points (docs/api/openapi.yaml) */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await applyLoyaltyOnCartWorkflow(req.scope).run({
    input: { cart_id: req.params.id, customer_id: req.auth_context.actor_id },
  })
  res.json({ cart: await refetchStorefrontCart(req.scope, req.params.id) })
}

/** DELETE /store/carts/{id}/loyalty-points: stop redeeming gift points */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await removeLoyaltyFromCartWorkflow(req.scope).run({
    input: { cart_id: req.params.id, customer_id: req.auth_context.actor_id },
  })
  res.json({ cart: await refetchStorefrontCart(req.scope, req.params.id) })
}
