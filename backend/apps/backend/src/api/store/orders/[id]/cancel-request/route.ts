import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { requestOrderCancellationWorkflow } from "../../../../../workflows/request-order-cancellation"

/** POST /store/orders/{id}/cancel-request (docs/api/openapi.yaml → requestOrderCancellation) */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { result } = await requestOrderCancellationWorkflow(req.scope).run({
    input: { order_id: req.params.id, customer_id: req.auth_context.actor_id },
  })
  res.json({
    cancellation_request: {
      id: result.id,
      order_id: result.order_id,
      status: result.status,
      created_at: result.created_at,
    },
  })
}
