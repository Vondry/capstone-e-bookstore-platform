import { z } from "@medusajs/framework/zod"

/** POST /store/reviews body (docs/api/openapi.yaml → createReview) */
export const StoreCreateReview = z.object({
  product_id: z.string().min(1),
  content: z.string().trim().min(1).max(100),
  rating: z.number().int().min(1).max(5),
})

export type StoreCreateReviewType = z.infer<typeof StoreCreateReview>
