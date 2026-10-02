import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"
import CancellationModule from "../modules/cancellation"

/** `order.cancellation_request` (at most one per order) */
export default defineLink(
  OrderModule.linkable.order,
  CancellationModule.linkable.cancellationRequest
)
