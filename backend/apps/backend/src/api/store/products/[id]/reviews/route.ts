import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import type ProductReviewModuleService from "../../../../../modules/product-review/service"

/** GET /store/products/{id}/reviews: approved reviews, newest first (docs/api/openapi.yaml) */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 10) || 10, 1), 50)
  const offset = Math.max(Number(req.query.offset ?? 0) || 0, 0)
  const reviewsModule: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)
  const filters = { product_id: req.params.id, status: "approved" as const }

  const [[reviews, count], all] = await Promise.all([
    reviewsModule.listAndCountReviews(filters, {
      order: { created_at: "DESC" },
      take: limit,
      skip: offset,
    }),
    reviewsModule.listReviews(filters, { select: ["rating"] }),
  ])
  const averageRating =
    all.length > 0
      ? Math.round((all.reduce((sum, review) => sum + review.rating, 0) / all.length) * 10) / 10
      : null

  res.json({
    reviews: reviews.map((review) => ({
      id: review.id,
      product_id: review.product_id,
      first_name: review.first_name,
      last_name: review.last_name,
      content: review.content,
      rating: review.rating,
      created_at: review.created_at,
    })),
    count,
    average_rating: averageRating,
  })
}
