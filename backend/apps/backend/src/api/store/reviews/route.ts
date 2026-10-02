import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createReviewWorkflow } from "../../../workflows/create-review"
import type { StoreCreateReviewType } from "./validators"

/** POST /store/reviews: leave a review (logged-in customers; docs/api/openapi.yaml) */
export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateReviewType>,
  res: MedusaResponse
) {
  const { result: review } = await createReviewWorkflow(req.scope).run({
    input: { ...req.validatedBody, customer_id: req.auth_context.actor_id },
  })
  res.json({
    review: {
      id: review.id,
      product_id: review.product_id,
      first_name: review.first_name,
      last_name: review.last_name,
      content: review.content,
      rating: review.rating,
      created_at: review.created_at,
    },
  })
}
