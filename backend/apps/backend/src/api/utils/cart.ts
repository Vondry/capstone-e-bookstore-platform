import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/** The cart fields the storefront reads (frontend: features/cart/mappers.ts → CART_FIELDS) */
export const STOREFRONT_CART_FIELDS = [
  "id",
  "region_id",
  "email",
  "currency_code",
  "metadata",
  "item_subtotal",
  "item_total",
  "tax_total",
  "shipping_total",
  "discount_total",
  "discount_tax_total",
  "total",
  "items.*",
  "items.adjustments.*",
  "shipping_address.*",
  "shipping_methods.*",
  "promotions.id",
  "promotions.code",
  "payment_collection.id",
]

export async function refetchStorefrontCart(container: MedusaContainer, cartId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [cart],
  } = await query.graph({
    entity: "cart",
    fields: STOREFRONT_CART_FIELDS,
    filters: { id: cartId },
  })
  return cart
}
