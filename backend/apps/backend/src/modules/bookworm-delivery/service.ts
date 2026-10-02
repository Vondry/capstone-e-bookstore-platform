/**
 * "Standard delivery" for Book Worm: ₹40, free when the items subtotal *before discounts* is at
 * least ₹499 (wireframe 03 shows free delivery for the ₹508 cart with a ₹100 coupon).
 *
 * A flat-rate price rule can't express this: when a shipping method is added, Medusa prices flat
 * options without the items subtotal. Calculated options are priced by this provider instead,
 * and Medusa re-prices them on every cart change. Fulfilment itself is manual.
 * Docs: https://docs.medusajs.com/resources/references/fulfillment/provider
 */

import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import type {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  FulfillmentOption,
} from "@medusajs/framework/types"

export const DELIVERY_CHARGE = 40
export const FREE_DELIVERY_FROM = 499
export const STANDARD_OPTION_ID = "standard"

type PricedItem = { unit_price?: unknown; quantity?: unknown }

/** The items subtotal before discounts and tax; prefers the value the pricing hook adds */
export function itemsSubtotal(context: Record<string, unknown>): number {
  if (context.item_subtotal !== undefined && context.item_subtotal !== null) {
    return Number(context.item_subtotal)
  }
  const items = (context.items ?? []) as PricedItem[]
  return items.reduce(
    (sum, item) => sum + Number(item.unit_price ?? 0) * Number(item.quantity ?? 0),
    0
  )
}

export function deliveryCharge(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_CHARGE
}

class BookwormDeliveryService extends AbstractFulfillmentProviderService {
  static identifier = "bookworm-delivery"

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [{ id: STANDARD_OPTION_ID }]
  }

  async validateFulfillmentData(
    _optionData: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return data
  }

  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    return data.id === STANDARD_OPTION_ID
  }

  async canCalculate(): Promise<boolean> {
    return true
  }

  async calculatePrice(
    _optionData: CalculateShippingOptionPriceDTO["optionData"],
    _data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    return {
      calculated_amount: deliveryCharge(itemsSubtotal(context as Record<string, unknown>)),
      // Delivery is GST-exempt (0 % tax rate rule in the seed), so the price is final
      is_calculated_price_tax_inclusive: false,
    }
  }

  async createFulfillment() {
    return { data: {}, labels: [] }
  }

  async cancelFulfillment() {
    return {}
  }

  async createReturnFulfillment() {
    return { data: {}, labels: [] }
  }
}

export default BookwormDeliveryService
