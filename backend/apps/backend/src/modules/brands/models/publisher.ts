import { model } from "@medusajs/framework/utils"

/** A book's publisher (deck journey 6: browse the brands) */
export const Publisher = model.define("publisher", {
  id: model.id().primaryKey(),
  slug: model.text().unique(),
  name: model.text().searchable(),
  description: model.text(),
})
