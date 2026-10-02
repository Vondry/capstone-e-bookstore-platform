import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ProductReviewModule from "../modules/product-review"

/** Read-only link: reviews store `product_id`, so `review.product` resolves without a join table */
export default defineLink(
  { linkable: ProductReviewModule.linkable.review, field: "product_id", isList: false },
  ProductModule.linkable.product,
  { readOnly: true }
)
