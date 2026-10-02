import BookwormDeliveryService, {
  DELIVERY_CHARGE,
  deliveryCharge,
  itemsSubtotal,
  STANDARD_OPTION_ID,
} from "../service"

describe("Book Worm delivery pricing", () => {
  it("charges ₹40 below ₹499 and nothing from ₹499", () => {
    expect(deliveryCharge(149)).toBe(DELIVERY_CHARGE)
    expect(deliveryCharge(498.99)).toBe(DELIVERY_CHARGE)
    expect(deliveryCharge(499)).toBe(0)
    expect(deliveryCharge(508)).toBe(0)
  })

  it("uses the items subtotal from the pricing hook (before discounts)", () => {
    // Wireframe 03: ₹508 with a ₹100 coupon still ships free
    expect(itemsSubtotal({ item_subtotal: 508, item_total: 456.96 })).toBe(508)
  })

  it("falls back to summing the items when the hook value is missing", () => {
    expect(
      itemsSubtotal({
        items: [
          { unit_price: 149, quantity: 1 },
          { unit_price: 359, quantity: 1 },
        ],
      })
    ).toBe(508)
  })

  it("prices the standard option and excludes tax from the price", async () => {
    const service = new BookwormDeliveryService()
    expect(await service.getFulfillmentOptions()).toEqual([{ id: STANDARD_OPTION_ID }])
    expect(await service.validateOption({ id: STANDARD_OPTION_ID })).toBe(true)
    expect(await service.validateOption({ id: "express" })).toBe(false)
    await expect(service.calculatePrice({}, {}, { item_subtotal: 149 } as never)).resolves.toEqual({
      calculated_amount: 40,
      is_calculated_price_tax_inclusive: false,
    })
  })
})
