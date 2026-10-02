/**
 * Gives the Book Worm delivery provider (src/modules/bookworm-delivery) the cart's items subtotal
 * before discounts, which decides free delivery from ₹499. Runs whenever calculated shipping
 * prices are computed: when a method is added and on every cart refresh.
 */

import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { listShippingOptionsForCartWithPricingWorkflow } from "@medusajs/medusa/core-flows"

listShippingOptionsForCartWithPricingWorkflow.hooks.setCalculatedShippingPricingContext(
  async ({ input }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const {
      data: [row],
    } = await query.graph({
      entity: "cart",
      fields: ["item_subtotal"],
      filters: { id: input.cart_id },
    })
    return new StepResponse({ item_subtotal: Number(row?.item_subtotal ?? 0) })
  }
)
