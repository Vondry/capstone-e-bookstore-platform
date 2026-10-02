/**
 * Creates a product review for a logged-in customer (plan 14 D6: approved on creation).
 * Based on Medusa's product reviews tutorial. Contract: POST /store/reviews.
 */

import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"
import type ProductReviewModuleService from "../modules/product-review/service"

export type CreateReviewInput = {
  product_id: string
  customer_id: string
  content: string
  rating: number
}

const getReviewerStep = createStep(
  "get-reviewer",
  async (input: CreateReviewInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const [{ data: products }, { data: customers }] = await Promise.all([
      query.graph({ entity: "product", fields: ["id"], filters: { id: input.product_id } }),
      query.graph({
        entity: "customer",
        fields: ["id", "first_name", "last_name"],
        filters: { id: input.customer_id },
      }),
    ])
    if (!products[0]) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Book not found")
    const customer = customers[0]
    if (!customer) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Log in to leave a review")
    return new StepResponse({
      first_name: customer.first_name ?? "",
      last_name: customer.last_name ?? "",
    })
  }
)

const createReviewStep = createStep(
  "create-review",
  async (input: CreateReviewInput & { first_name: string; last_name: string }, { container }) => {
    const reviews: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
    const review = await reviews.createReviews({ ...input, status: "approved" })
    return new StepResponse(review, review.id)
  },
  async (reviewId, { container }) => {
    if (!reviewId) return
    const reviews: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
    await reviews.deleteReviews(reviewId)
  }
)

export const createReviewWorkflow = createWorkflow("create-review", (input: CreateReviewInput) => {
  const reviewer = getReviewerStep(input)
  // Combine at run time; a spread here would run when the workflow is defined
  const reviewData = transform({ input, reviewer }, ({ input, reviewer }) => ({
    ...input,
    first_name: reviewer.first_name,
    last_name: reviewer.last_name,
  }))
  const review = createReviewStep(reviewData)
  return new WorkflowResponse(review)
})
