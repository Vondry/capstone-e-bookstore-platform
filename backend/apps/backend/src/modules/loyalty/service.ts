import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import { LoyaltyPoint } from "./models/loyalty-point"

/** SIMULATED rules (docs/data-model.md): earn 1 point per ₹10, redeem at most 50 % of the order */
export const POINTS_PER_RUPEES = 10
export const MAX_POINTS_SHARE = 0.5

export function pointsEarnedFor(total: number): number {
  return Math.max(0, Math.floor(total / POINTS_PER_RUPEES))
}

/** Same cap as the frontend's maxRedeemablePoints (features/checkout/lib/totals.ts) */
export function maxRedeemablePoints(amount: number, available: number): number {
  return Math.max(0, Math.min(Math.floor(available), Math.floor(amount * MAX_POINTS_SHARE)))
}

class LoyaltyModuleService extends MedusaService({ LoyaltyPoint }) {
  async getPoints(customerId: string): Promise<number> {
    const [row] = await this.listLoyaltyPoints({ customer_id: customerId })
    return row?.points ?? 0
  }

  /** Adds (or with a negative value, spends) points; never goes below zero */
  async changePoints(customerId: string, delta: number): Promise<number> {
    const [row] = await this.listLoyaltyPoints({ customer_id: customerId })
    const points = (row?.points ?? 0) + delta
    if (points < 0) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Not enough gift points")
    }
    if (row) {
      await this.updateLoyaltyPoints({ id: row.id, points })
    } else {
      await this.createLoyaltyPoints({ customer_id: customerId, points })
    }
    return points
  }
}

export default LoyaltyModuleService
