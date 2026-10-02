import {
  authenticate,
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http"
import { StoreCreateReview } from "./store/reviews/validators"

/** Lets store routes return linked data that core routes don't allow by default */
const allowFields =
  (...fields: string[]) =>
  (req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) => {
    req.allowed = [...(req.allowed ?? []), ...fields]
    next()
  }

const customerOnly = authenticate("customer", ["bearer", "session"])

export default defineMiddlewares({
  routes: [
    // The product index declares filterable `status` and `sales_channel_ids`, so
    // the route narrows it to published products in the key's sales channels.
    {
      method: ["POST"],
      matcher: "/store/search",
      middlewares: [configureStoreSearch({ allowed_indexes: { product: true } })],
    },
    // Book Worm: a book's writer and publisher (Brands module links)
    // (no `method`: Medusa validates query fields before method-scoped middlewares run)
    {
      matcher: "/store/products*",
      middlewares: [allowFields("writer", "publisher")],
    },
    // Book Worm: an order's cancellation request, and its metadata (payment method) for its owner
    {
      matcher: "/store/orders*",
      middlewares: [allowFields("cancellation_request", "metadata")],
    },
    {
      method: ["POST"],
      matcher: "/store/orders/:id/cancel-request",
      middlewares: [customerOnly],
    },
    {
      method: ["GET"],
      matcher: "/store/customers/me/loyalty-points",
      middlewares: [customerOnly],
    },
    {
      method: ["POST", "DELETE"],
      matcher: "/store/carts/:id/loyalty-points",
      middlewares: [customerOnly],
    },
    {
      method: ["POST"],
      matcher: "/store/reviews",
      middlewares: [customerOnly, validateAndTransformBody(StoreCreateReview)],
    },
  ],
})
