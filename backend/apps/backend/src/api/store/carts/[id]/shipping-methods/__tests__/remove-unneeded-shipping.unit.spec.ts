import { unneededShippingMethodIds } from "../../../../../../workflows/remove-unneeded-shipping"

describe("unneededShippingMethodIds (DELETE /store/carts/:id/shipping-methods)", () => {
  it("removes every shipping method of an eBook-only cart", () => {
    expect(
      unneededShippingMethodIds({
        id: "cart_1",
        items: [{ requires_shipping: false }],
        shipping_methods: [{ id: "casm_1" }, { id: "casm_2" }],
      })
    ).toEqual({ ids: ["casm_1", "casm_2"] })
  })

  it("refuses while a book in the cart still needs delivery", () => {
    expect(
      unneededShippingMethodIds({
        id: "cart_1",
        items: [{ requires_shipping: false }, { requires_shipping: true }],
        shipping_methods: [{ id: "casm_1" }],
      })
    ).toEqual({ error: "This cart has books that need delivery" })
  })

  it("has nothing to remove from an empty cart without delivery", () => {
    expect(unneededShippingMethodIds({ id: "cart_1", items: null, shipping_methods: null })).toEqual(
      { ids: [] }
    )
  })
})
