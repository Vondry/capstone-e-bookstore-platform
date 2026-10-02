import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import BrandsModule from "../modules/brands"

/** Each book has one writer; a writer has many books (`product.writer`, `writer.products`) */
export default defineLink(
  { linkable: ProductModule.linkable.product, isList: true },
  BrandsModule.linkable.writer
)
