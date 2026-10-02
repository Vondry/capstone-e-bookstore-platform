import { model } from "@medusajs/framework/utils"

/** A book's author (deck journey 6: browse the brands) */
export const Writer = model.define("writer", {
  id: model.id().primaryKey(),
  slug: model.text().unique(),
  name: model.text().searchable(),
  /** One entry per paragraph */
  bio: model.array(),
  avatar_url: model.text(),
})
