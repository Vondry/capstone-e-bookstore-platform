import LoyaltyModuleService, {
  maxRedeemablePoints,
  pointsEarnedFor,
  POINTS_PER_RUPEES,
} from "../service"
import { MedusaError } from "@medusajs/framework/utils"

describe("Loyalty points calculation", () => {
  it("earns 1 point per ₹10 spent", () => {
    expect(pointsEarnedFor(0)).toBe(0)
    expect(pointsEarnedFor(9)).toBe(0)
    expect(pointsEarnedFor(10)).toBe(1)
    expect(pointsEarnedFor(99)).toBe(9)
    expect(pointsEarnedFor(100)).toBe(10)
    expect(pointsEarnedFor(499)).toBe(49)
    expect(pointsEarnedFor(508)).toBe(50)
    expect(pointsEarnedFor(-50)).toBe(0)
  })

  it("caps redemption at 50 % of the amount and available balance", () => {
    // 50 % of ₹500 is ₹250; available 100 -> 100
    expect(maxRedeemablePoints(500, 100)).toBe(100)
    // 50 % of ₹500 is ₹250; available 300 -> 250
    expect(maxRedeemablePoints(500, 300)).toBe(250)
    // 0 points available
    expect(maxRedeemablePoints(500, 0)).toBe(0)
    // 0 amount
    expect(maxRedeemablePoints(0, 100)).toBe(0)
    // Negative inputs clamp to 0
    expect(maxRedeemablePoints(-100, 50)).toBe(0)
    expect(maxRedeemablePoints(100, -10)).toBe(0)
  })

  describe("LoyaltyModuleService", () => {
    type DataMethods = "listLoyaltyPoints" | "createLoyaltyPoints" | "updateLoyaltyPoints"

    /** The service with its generated data methods stubbed (they're read-only in the types) */
    const serviceWith = (stubs: Partial<Record<DataMethods, jest.Mock>>) =>
      Object.assign(Object.create(LoyaltyModuleService.prototype), stubs) as LoyaltyModuleService

    const balanceRow = (points: number) => [{ id: "lp_1", customer_id: "cust_123", points }]

    it("returns 0 points when customer has no record", async () => {
      const service = serviceWith({ listLoyaltyPoints: jest.fn().mockResolvedValue([]) })

      const balance = await service.getPoints("cust_123")
      expect(balance).toBe(0)
    })

    it("returns points from customer record", async () => {
      const service = serviceWith({ listLoyaltyPoints: jest.fn().mockResolvedValue(balanceRow(120)) })

      const balance = await service.getPoints("cust_123")
      expect(balance).toBe(120)
    })

    it("creates a points record on first earn", async () => {
      const createLoyaltyPoints = jest.fn().mockResolvedValue({})
      const service = serviceWith({
        listLoyaltyPoints: jest.fn().mockResolvedValue([]),
        createLoyaltyPoints,
      })

      const newBalance = await service.changePoints("cust_123", 50)
      expect(newBalance).toBe(50)
      expect(createLoyaltyPoints).toHaveBeenCalledWith({
        customer_id: "cust_123",
        points: 50,
      })
    })

    it("updates existing points balance", async () => {
      const updateLoyaltyPoints = jest.fn().mockResolvedValue({})
      const service = serviceWith({
        listLoyaltyPoints: jest.fn().mockResolvedValue(balanceRow(120)),
        updateLoyaltyPoints,
      })

      const newBalance = await service.changePoints("cust_123", -20)
      expect(newBalance).toBe(100)
      expect(updateLoyaltyPoints).toHaveBeenCalledWith({ id: "lp_1", points: 100 })
    })

    it("throws MedusaError when spending more points than available", async () => {
      const service = serviceWith({ listLoyaltyPoints: jest.fn().mockResolvedValue(balanceRow(20)) })

      await expect(service.changePoints("cust_123", -50)).rejects.toThrow(
        new MedusaError(MedusaError.Types.NOT_ALLOWED, "Not enough gift points")
      )
    })
  })
})
