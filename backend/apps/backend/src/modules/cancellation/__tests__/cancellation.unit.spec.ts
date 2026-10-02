import { CANCEL_WINDOW_HOURS } from "../service"
import { isInsideCancelWindow } from "../../../workflows/request-order-cancellation"

describe("Order cancellation window (48 h rule)", () => {
  const HOUR_MS = 60 * 60 * 1000

  it("exports CANCEL_WINDOW_HOURS = 48", () => {
    expect(CANCEL_WINDOW_HOURS).toBe(48)
  })

  it("allows cancellation when order was just placed", () => {
    const now = new Date("2026-10-01T12:00:00Z")
    const createdAt = new Date("2026-10-01T12:00:00Z")
    expect(isInsideCancelWindow(createdAt, now)).toBe(true)
  })

  it("allows cancellation 2 hours after order was placed (demo order #1002)", () => {
    const now = new Date("2026-10-01T14:00:00Z")
    const createdAt = new Date("2026-10-01T12:00:00Z")
    expect(isInsideCancelWindow(createdAt, now)).toBe(true)
  })

  it("allows cancellation at 47 hours 59 minutes", () => {
    const now = new Date("2026-10-03T11:59:00Z")
    const createdAt = new Date("2026-10-01T12:00:00Z")
    expect(isInsideCancelWindow(createdAt, now)).toBe(true)
  })

  it("disallows cancellation at exactly 48 hours", () => {
    const createdAt = new Date("2026-10-01T12:00:00Z")
    const now = new Date(createdAt.getTime() + 48 * HOUR_MS)
    expect(isInsideCancelWindow(createdAt, now)).toBe(false)
  })

  it("disallows cancellation beyond 48 hours (demo order #1001: 240 hours)", () => {
    const createdAt = new Date("2026-09-21T12:00:00Z")
    const now = new Date("2026-10-01T12:00:00Z")
    expect(isInsideCancelWindow(createdAt, now)).toBe(false)
  })
})
