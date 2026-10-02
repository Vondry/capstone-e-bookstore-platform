import { StoreCreateReview } from "../../../api/store/reviews/validators"

describe("Product review validation (StoreCreateReview)", () => {
  it("accepts valid review input", () => {
    const valid = {
      product_id: "prod_123",
      content: "A wonderful read with thoughtful insights.",
      rating: 5,
    }
    const result = StoreCreateReview.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(valid)
    }
  })

  it("trims whitespace from review content", () => {
    const input = {
      product_id: "prod_123",
      content: "   Great book!   ",
      rating: 4,
    }
    const result = StoreCreateReview.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.content).toBe("Great book!")
    }
  })

  it("rejects empty product_id", () => {
    const input = {
      product_id: "",
      content: "Good book",
      rating: 4,
    }
    const result = StoreCreateReview.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects reviews longer than 100 characters", () => {
    const input = {
      product_id: "prod_123",
      content: "A".repeat(101),
      rating: 4,
    }
    const result = StoreCreateReview.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects rating outside 1 to 5", () => {
    expect(
      StoreCreateReview.safeParse({ product_id: "prod_123", content: "ok", rating: 0 }).success
    ).toBe(false)
    expect(
      StoreCreateReview.safeParse({ product_id: "prod_123", content: "ok", rating: 6 }).success
    ).toBe(false)
  })

  it("rejects non-integer ratings", () => {
    expect(
      StoreCreateReview.safeParse({ product_id: "prod_123", content: "ok", rating: 4.5 }).success
    ).toBe(false)
  })
})
