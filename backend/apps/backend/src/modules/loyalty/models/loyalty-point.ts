import { model } from "@medusajs/framework/utils"

/** A customer's gift points balance (1 point = ₹1) */
export const LoyaltyPoint = model
  .define("loyalty_point", {
    id: model.id().primaryKey(),
    customer_id: model.text().unique(),
    points: model.number().default(0),
  })
  .checks([(columns) => `${columns.points} >= 0`])
