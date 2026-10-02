/**
 * Removes a cart's shipping methods once nothing in it needs shipping (eBook-only carts).
 *
 * Medusa keeps a shipping method on the cart when the last physical book is removed, so a cart
 * that once held a paperback went on charging ₹40 delivery for eBooks. The store API can add a
 * shipping method but not remove one; this backs DELETE /store/carts/{id}/shipping-methods.
 * Carts that still need delivery are refused, so delivery can't be dropped from a paperback order.
 */

import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  acquireLockStep,
  refreshCartItemsWorkflow,
  releaseLockStep,
  removeShippingMethodFromCartStep,
} from "@medusajs/medusa/core-flows"

export type ShippingCartRow = {
  id: string
  items: { requires_shipping: boolean | null }[] | null
  shipping_methods: { id: string }[] | null
}

/** The shipping methods to remove, or an error message when the cart still needs delivery */
export function unneededShippingMethodIds(
  cart: ShippingCartRow
): { ids: string[] } | { error: string } {
  if ((cart.items ?? []).some((item) => item.requires_shipping)) {
    return { error: "This cart has books that need delivery" }
  }
  return { ids: (cart.shipping_methods ?? []).map((method) => method.id) }
}

const findUnneededShippingMethodsStep = createStep(
  "find-unneeded-shipping-methods",
  async (input: { cart_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const {
      data: [cart],
    } = await query.graph({
      entity: "cart",
      fields: ["id", "items.requires_shipping", "shipping_methods.id"],
      filters: { id: input.cart_id },
    })
    const row = cart as unknown as ShippingCartRow | undefined
    if (!row) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Cart not found")

    const result = unneededShippingMethodIds(row)
    if ("error" in result) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, result.error)
    return new StepResponse(result.ids)
  }
)

export const removeUnneededShippingWorkflow = createWorkflow(
  "remove-unneeded-shipping",
  (input: { cart_id: string }) => {
    // Same lock as Medusa's own cart workflows, so this can't interleave with an add to cart
    acquireLockStep({ key: input.cart_id, timeout: 2, ttl: 10 })

    const ids = findUnneededShippingMethodsStep(input)
    removeShippingMethodFromCartStep({ shipping_method_ids: ids })
    // Recalculates taxes, promotions and the payment collection without the delivery charge
    refreshCartItemsWorkflow.runAsStep({ input: { cart_id: input.cart_id } })

    releaseLockStep({ key: input.cart_id })
    return new WorkflowResponse({ cart_id: input.cart_id })
  }
)
