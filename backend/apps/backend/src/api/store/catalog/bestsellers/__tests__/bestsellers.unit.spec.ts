import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GET } from "../route"

describe("Bestsellers endpoint (GET /store/catalog/bestsellers)", () => {
  const mockGraph = jest.fn()
  const mockScope = {
    resolve: (key: string) => {
      if (key === ContainerRegistrationKeys.QUERY) {
        return { graph: mockGraph }
      }
      throw new Error(`Unexpected resolve key: ${key}`)
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("ranks products by recent order volume and falls back to metadata.sold_count", async () => {
    // 3 products:
    // p1: 100 sold_count, 5 recent sales
    // p2: 500 sold_count, 0 recent sales
    // p3: 200 sold_count, 10 recent sales
    // Expected order: p3 (10 recent), p1 (5 recent), p2 (0 recent, but higher sold_count)
    mockGraph
      .mockResolvedValueOnce({
        data: [
          { id: "p1", metadata: { sold_count: 100 } },
          { id: "p2", metadata: { sold_count: 500 } },
          { id: "p3", metadata: { sold_count: 200 } },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          { items: [{ product_id: "p1", quantity: 5 }] },
          { items: [{ product_id: "p3", quantity: 10 }] },
        ],
      })

    const req: any = { query: { limit: "3" }, scope: mockScope }
    const jsonMock = jest.fn()
    const res: any = { json: jsonMock }

    await GET(req, res)

    expect(jsonMock).toHaveBeenCalledWith({
      product_ids: ["p3", "p1", "p2"],
    })
  })

  it("clamps limit between 1 and 20 (defaults to 3)", async () => {
    mockGraph
      .mockResolvedValueOnce({
        data: Array.from({ length: 25 }, (_, i) => ({
          id: `p${i + 1}`,
          metadata: { sold_count: i },
        })),
      })
      .mockResolvedValueOnce({ data: [] })

    const jsonMock = jest.fn()
    const res: any = { json: jsonMock }

    // No limit passed -> default 3
    await GET({ query: {}, scope: mockScope } as any, res)
    expect(jsonMock.mock.calls[0][0].product_ids).toHaveLength(3)

    // Limit 0 or negative -> clamped to 1
    mockGraph
      .mockResolvedValueOnce({
        data: Array.from({ length: 5 }, (_, i) => ({ id: `p${i}`, metadata: {} })),
      })
      .mockResolvedValueOnce({ data: [] })
    await GET({ query: { limit: "-5" }, scope: mockScope } as any, res)
    expect(jsonMock.mock.calls[1][0].product_ids).toHaveLength(1)

    // Limit 50 -> clamped to 20
    mockGraph
      .mockResolvedValueOnce({
        data: Array.from({ length: 25 }, (_, i) => ({ id: `p${i}`, metadata: {} })),
      })
      .mockResolvedValueOnce({ data: [] })
    await GET({ query: { limit: "50" }, scope: mockScope } as any, res)
    expect(jsonMock.mock.calls[2][0].product_ids).toHaveLength(20)
  })
})
