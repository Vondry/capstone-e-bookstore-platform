/**
 * Records a customer's request to cancel their order within 48 h (deck journey 12).
 * Medusa has no store-side cancel, so the store confirms it in Medusa Admin.
 * Contract: POST /store/orders/{id}/cancel-request (docs/api/openapi.yaml).
 */

import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { CANCELLATION_MODULE } from "../modules/cancellation"
import type CancellationModuleService from "../modules/cancellation/service"
import { CANCEL_WINDOW_HOURS } from "../modules/cancellation/service"

const HOUR_MS = 60 * 60 * 1000

export type RequestOrderCancellationInput = {
  order_id: string
  customer_id: string
  /** Injectable clock for tests */
  now?: string
}

type OrderRow = {
  id: string
  customer_id: string | null
  created_at: string | Date
  cancellation_request?: { id: string } | null
}

/** True while the order is younger than 48 h (same rule as the frontend's cancelWindow.ts) */
export function isInsideCancelWindow(createdAt: Date, now: Date): boolean {
  return now.getTime() - createdAt.getTime() < CANCEL_WINDOW_HOURS * HOUR_MS
}

const validateOrderCancellationStep = createStep(
  "validate-order-cancellation",
  async (input: RequestOrderCancellationInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const {
      data: [order],
    } = await query.graph({
      entity: "order",
      fields: ["id", "customer_id", "created_at", "cancellation_request.id"],
      filters: { id: input.order_id },
    })
    const row = order as OrderRow | undefined
    // Someone else's order looks the same as a missing one
    if (!row || row.customer_id !== input.customer_id) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found")
    }
    if (row.cancellation_request) {
      throw new MedusaError(MedusaError.Types.CONFLICT, "A cancellation was already requested")
    }
    const now = input.now ? new Date(input.now) : new Date()
    if (!isInsideCancelWindow(new Date(row.created_at), now)) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        `Orders can only be cancelled within ${CANCEL_WINDOW_HOURS} hours`
      )
    }
    return new StepResponse(row)
  }
)

const createCancellationRequestStep = createStep(
  "create-cancellation-request",
  async (input: { order_id: string; customer_id: string }, { container }) => {
    const cancellation: CancellationModuleService = container.resolve(CANCELLATION_MODULE)
    const request = await cancellation.createCancellationRequests({
      order_id: input.order_id,
      customer_id: input.customer_id,
    })
    return new StepResponse(request, request.id)
  },
  async (requestId, { container }) => {
    if (!requestId) return
    const cancellation: CancellationModuleService = container.resolve(CANCELLATION_MODULE)
    await cancellation.deleteCancellationRequests(requestId)
  }
)

const linkCancellationRequestStep = createStep(
  "link-cancellation-request",
  async (input: { order_id: string; request_id: string }, { container }) => {
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const definition = {
      [Modules.ORDER]: { order_id: input.order_id },
      [CANCELLATION_MODULE]: { cancellation_request_id: input.request_id },
    }
    await link.create(definition)
    return new StepResponse(undefined, definition)
  },
  async (definition, { container }) => {
    if (!definition) return
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    await link.dismiss(definition)
  }
)

export const requestOrderCancellationWorkflow = createWorkflow(
  "request-order-cancellation",
  (input: RequestOrderCancellationInput) => {
    validateOrderCancellationStep(input)
    const request = createCancellationRequestStep({
      order_id: input.order_id,
      customer_id: input.customer_id,
    })
    linkCancellationRequestStep({ order_id: input.order_id, request_id: request.id })
    return new WorkflowResponse(request)
  }
)
