import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { refetchStorefrontCart } from "../../../../utils/cart"
import { removeUnneededShippingWorkflow } from "../../../../../workflows/remove-unneeded-shipping"

/**
 * DELETE /store/carts/{id}/shipping-methods: drop the delivery of a cart that no longer needs it
 * (eBook-only). Medusa's own POST on this path still adds a shipping method. docs/api/openapi.yaml
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await removeUnneededShippingWorkflow(req.scope).run({ input: { cart_id: req.params.id } })
  res.json({ cart: await refetchStorefrontCart(req.scope, req.params.id) })
}
