import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import BrandsModule from "../modules/brands"

/** Each book has one publisher; a publisher has many books (`product.publisher`, `publisher.products`) */
export default defineLink(
  { linkable: ProductModule.linkable.product, isList: true },
  BrandsModule.linkable.publisher
)
