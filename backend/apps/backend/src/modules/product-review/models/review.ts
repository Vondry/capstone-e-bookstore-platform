import { model } from "@medusajs/framework/utils"

/**
 * A product review (architecture diagram: Member → rate & endorse). Based on Medusa's
 * product reviews tutorial. Plan 14 D6: reviews need login and are approved on creation;
 * an admin can still reject them.
 */
export const Review = model
  .define("review", {
    id: model.id().primaryKey(),
    product_id: model.text().index(),
    customer_id: model.text().nullable(),
    first_name: model.text(),
    last_name: model.text(),
    content: model.text(),
    rating: model.number(),
    status: model.enum(["pending", "approved", "rejected"]).default("approved"),
  })
  .checks([
    {
      name: "review_rating_check",
      expression: (columns) => `${columns.rating} >= 1 AND ${columns.rating} <= 5`,
    },
    {
      name: "review_content_length_check",
      expression: (columns) => `char_length(${columns.content}) BETWEEN 1 AND 100`,
    },
  ])
