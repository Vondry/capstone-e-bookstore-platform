/**
 * Gift points (deck journey 10: redeem gift points), following Medusa's loyalty points tutorial:
 * redeeming creates a single-use promotion restricted to the customer and applies it to the cart.
 * Rules (docs/data-model.md): earn 1 point per ₹10, redeem 1 point = ₹1, at most 50 % of the
 * order after the coupon. Points are spent when the order is placed, not when applied.
 *
 * Contract: GET /store/customers/me/loyalty-points, POST/DELETE /store/carts/{id}/loyalty-points.
 * The promotion code starts with LOYALTY- so the storefront can tell it from a coupon.
 */

import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, PromotionActions } from "@medusajs/framework/utils"
import {
  createPromotionsWorkflow,
  updateCartPromotionsWorkflow,
  updateCartWorkflow,
  updatePromotionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { LOYALTY_MODULE } from "../modules/loyalty"
import type LoyaltyModuleService from "../modules/loyalty/service"
import { maxRedeemablePoints, pointsEarnedFor } from "../modules/loyalty/service"

export const LOYALTY_CODE_PREFIX = "LOYALTY-"

type CartRow = {
  id: string
  customer_id: string | null
  currency_code: string
  item_subtotal: number
  discount_total: number
  discount_tax_total: number
  metadata: Record<string, unknown> | null
  promotions: { id: string; code: string | null }[]
}

const isLoyaltyCode = (code: string | null | undefined) =>
  code?.startsWith(LOYALTY_CODE_PREFIX) ?? false

const getLoyaltyCartStep = createStep(
  "get-loyalty-cart",
  async (input: { cart_id: string; customer_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const {
      data: [cart],
    } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "customer_id",
        "currency_code",
        "item_subtotal",
        "discount_total",
        "discount_tax_total",
        "metadata",
        "promotions.id",
        "promotions.code",
      ],
      filters: { id: input.cart_id },
    })
    const row = cart as unknown as CartRow | undefined
    if (!row) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Cart not found")
    // Only the customer's own cart can use their points
    if (row.customer_id !== input.customer_id) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Log in to redeem gift points")
    }
    return new StepResponse(row)
  }
)

const calculateLoyaltyRedemptionStep = createStep(
  "calculate-loyalty-redemption",
  async (input: { cart: CartRow; customer_id: string }, { container }) => {
    if (input.cart.promotions.some((promotion) => isLoyaltyCode(promotion.code))) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Gift points are already applied")
    }
    const loyalty: LoyaltyModuleService = container.resolve(LOYALTY_MODULE)
    const available = await loyalty.getPoints(input.customer_id)
    // Existing coupon discount, before tax (what the Grand Total shows)
    const couponDiscount = Number(input.cart.discount_total) - Number(input.cart.discount_tax_total)
    const amount = maxRedeemablePoints(Number(input.cart.item_subtotal) - couponDiscount, available)
    if (amount <= 0) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "You have no gift points to redeem")
    }
    return new StepResponse({
      amount,
      code: `${LOYALTY_CODE_PREFIX}${input.cart.id.slice(-10)}-${Date.now()}`,
    })
  }
)

export const applyLoyaltyOnCartWorkflow = createWorkflow(
  "apply-loyalty-on-cart",
  (input: { cart_id: string; customer_id: string }) => {
    const cart = getLoyaltyCartStep(input)
    const redemption = calculateLoyaltyRedemptionStep({ cart, customer_id: input.customer_id })

    const promotionsData = transform({ input, cart, redemption }, ({ input, cart, redemption }) => [
      {
        code: redemption.code,
        type: "standard" as const,
        status: "active" as const,
        is_automatic: false,
        // Single use, and only by this customer
        limit: 1,
        application_method: {
          type: "fixed" as const,
          target_type: "order" as const,
          allocation: "across" as const,
          value: redemption.amount,
          currency_code: cart.currency_code,
        },
        rules: [{ attribute: "customer_id", operator: "eq" as const, values: [input.customer_id] }],
      },
    ])
    const promotions = createPromotionsWorkflow.runAsStep({ input: { promotionsData } })

    updateCartPromotionsWorkflow.runAsStep({
      input: {
        cart_id: input.cart_id,
        promo_codes: transform({ redemption }, ({ redemption }) => [redemption.code]),
        action: PromotionActions.ADD,
      },
    })

    const update = transform({ input, cart, promotions }, ({ input, cart, promotions }) => ({
      id: input.cart_id,
      metadata: { ...(cart.metadata ?? {}), loyalty_promo_id: promotions[0].id },
    }))
    updateCartWorkflow.runAsStep({ input: update })

    return new WorkflowResponse({ cart_id: input.cart_id })
  }
)

export const removeLoyaltyFromCartWorkflow = createWorkflow(
  "remove-loyalty-from-cart",
  (input: { cart_id: string; customer_id: string }) => {
    const cart = getLoyaltyCartStep(input)
    const loyaltyPromotions = transform({ cart }, ({ cart }) =>
      cart.promotions.filter((promotion) => isLoyaltyCode(promotion.code))
    )

    updateCartPromotionsWorkflow.runAsStep({
      input: {
        cart_id: input.cart_id,
        promo_codes: transform({ loyaltyPromotions }, ({ loyaltyPromotions }) =>
          loyaltyPromotions.map((promotion) => promotion.code as string)
        ),
        action: PromotionActions.REMOVE,
      },
    })

    // The promotion can't be reused; deactivate it
    updatePromotionsWorkflow.runAsStep({
      input: {
        promotionsData: transform({ loyaltyPromotions }, ({ loyaltyPromotions }) =>
          loyaltyPromotions.map((promotion) => ({ id: promotion.id, status: "inactive" as const }))
        ),
      },
    })

    const update = transform({ input, cart }, ({ input, cart }) => {
      const { loyalty_promo_id: _removed, ...metadata } = cart.metadata ?? {}
      return { id: input.cart_id, metadata }
    })
    updateCartWorkflow.runAsStep({ input: update })

    return new WorkflowResponse({ cart_id: input.cart_id })
  }
)

type OrderRow = {
  id: string
  customer_id: string | null
  total: number
  items: { adjustments?: { code: string | null; amount: number }[] | null }[] | null
}

const settleOrderPointsStep = createStep(
  "settle-order-points",
  async (input: { order_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const {
      data: [order],
    } = await query.graph({
      entity: "order",
      fields: ["id", "customer_id", "total", "items.adjustments.code", "items.adjustments.amount"],
      filters: { id: input.order_id },
    })
    const row = order as unknown as OrderRow | undefined
    // Guests don't collect points
    if (!row?.customer_id) return new StepResponse({ delta: 0 }, null)

    const redeemed = (row.items ?? [])
      .flatMap((item) => item.adjustments ?? [])
      .filter((adjustment) => isLoyaltyCode(adjustment.code))
      .reduce((sum, adjustment) => sum + Number(adjustment.amount), 0)
    const delta = pointsEarnedFor(Number(row.total)) - Math.round(redeemed)

    const loyalty: LoyaltyModuleService = container.resolve(LOYALTY_MODULE)
    await loyalty.changePoints(row.customer_id, delta)
    return new StepResponse({ delta }, { customer_id: row.customer_id, delta })
  },
  async (change, { container }) => {
    if (!change) return
    const loyalty: LoyaltyModuleService = container.resolve(LOYALTY_MODULE)
    await loyalty.changePoints(change.customer_id, -change.delta)
  }
)

/** Run by the order.placed subscriber: spend the redeemed points, add the earned ones */
export const settleOrderPointsWorkflow = createWorkflow(
  "settle-order-points",
  (input: { order_id: string }) => {
    const result = settleOrderPointsStep(input)
    return new WorkflowResponse(result)
  }
)
