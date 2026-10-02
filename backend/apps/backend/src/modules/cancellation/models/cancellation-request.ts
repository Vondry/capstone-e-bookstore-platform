import { model } from "@medusajs/framework/utils"

/**
 * A customer's request to cancel an order within 48 h (deck journey 12). The store confirms or
 * rejects it in Medusa Admin; until then the storefront shows "Cancellation requested".
 */
export const CancellationRequest = model.define("cancellation_request", {
  id: model.id().primaryKey(),
  order_id: model.text().unique(),
  customer_id: model.text().index(),
  status: model.enum(["requested", "approved", "rejected"]).default("requested"),
})
