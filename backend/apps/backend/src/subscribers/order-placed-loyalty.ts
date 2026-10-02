import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { settleOrderPointsWorkflow } from "../workflows/loyalty"

/** Spends the redeemed gift points and adds the ones earned (1 per ₹10) when an order is placed */
export default async function orderPlacedLoyaltyHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await settleOrderPointsWorkflow(container).run({ input: { order_id: data.id } })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
