import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  getPublisher,
  getWriter,
  listPublishers,
  listWriters,
} from "../../../api/utils/brands"

describe("Brands query helpers", () => {
  const mockGraph = jest.fn()
  const mockContainer = {
    resolve: (key: string) => {
      if (key === ContainerRegistrationKeys.QUERY) {
        return { graph: mockGraph }
      }
      throw new Error(`Unexpected resolve key: ${key}`)
    },
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("listWriters", () => {
    it("returns writers sorted by name with book count", async () => {
      mockGraph.mockResolvedValueOnce({
        data: [
          {
            slug: "vikram-seth",
            name: "Vikram Seth",
            avatar_url: "avatar-vs.png",
            products: [{ id: "p1" }, { id: "p2" }],
          },
          {
            slug: "arundhati-roy",
            name: "Arundhati Roy",
            avatar_url: "avatar-ar.png",
            products: [{ id: "p3" }],
          },
        ],
      })

      const writers = await listWriters(mockContainer)
      expect(writers).toEqual([
        {
          slug: "arundhati-roy",
          name: "Arundhati Roy",
          avatar_url: "avatar-ar.png",
          book_count: 1,
        },
        {
          slug: "vikram-seth",
          name: "Vikram Seth",
          avatar_url: "avatar-vs.png",
          book_count: 2,
        },
      ])
    })
  })

  describe("getWriter", () => {
    it("returns writer with bio and product IDs", async () => {
      mockGraph.mockResolvedValueOnce({
        data: [
          {
            slug: "arundhati-roy",
            name: "Arundhati Roy",
            bio: ["Award-winning author.", "Known for The God of Small Things."],
            avatar_url: "avatar-ar.png",
            products: [{ id: "p3" }],
          },
        ],
      })

      const writer = await getWriter(mockContainer, "arundhati-roy")
      expect(writer).toEqual({
        slug: "arundhati-roy",
        name: "Arundhati Roy",
        bio: ["Award-winning author.", "Known for The God of Small Things."],
        avatar_url: "avatar-ar.png",
        product_ids: ["p3"],
      })
    })

    it("throws MedusaError NOT_FOUND if writer is not found", async () => {
      mockGraph.mockResolvedValueOnce({ data: [] })

      await expect(getWriter(mockContainer, "unknown-writer")).rejects.toThrow(
        new MedusaError(MedusaError.Types.NOT_FOUND, "Writer not found")
      )
    })
  })

  describe("listPublishers", () => {
    it("returns publishers sorted by name with book count", async () => {
      mockGraph.mockResolvedValueOnce({
        data: [
          {
            slug: "penguin-india",
            name: "Penguin India",
            description: "Publisher description",
            products: [{ id: "p1" }],
          },
          {
            slug: "harpercollins-india",
            name: "HarperCollins India",
            description: "Another description",
            products: [{ id: "p2" }, { id: "p3" }],
          },
        ],
      })

      const publishers = await listPublishers(mockContainer)
      expect(publishers).toEqual([
        {
          slug: "harpercollins-india",
          name: "HarperCollins India",
          description: "Another description",
          book_count: 2,
        },
        {
          slug: "penguin-india",
          name: "Penguin India",
          description: "Publisher description",
          book_count: 1,
        },
      ])
    })
  })

  describe("getPublisher", () => {
    it("returns publisher details with book count and product IDs", async () => {
      mockGraph.mockResolvedValueOnce({
        data: [
          {
            slug: "penguin-india",
            name: "Penguin India",
            description: "Publisher description",
            products: [{ id: "p1" }],
          },
        ],
      })

      const publisher = await getPublisher(mockContainer, "penguin-india")
      expect(publisher).toEqual({
        slug: "penguin-india",
        name: "Penguin India",
        description: "Publisher description",
        book_count: 1,
        product_ids: ["p1"],
      })
    })

    it("throws MedusaError NOT_FOUND if publisher is not found", async () => {
      mockGraph.mockResolvedValueOnce({ data: [] })

      await expect(getPublisher(mockContainer, "unknown-pub")).rejects.toThrow(
        new MedusaError(MedusaError.Types.NOT_FOUND, "Publisher not found")
      )
    })
  })
})
