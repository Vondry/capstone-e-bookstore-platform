import { Module } from "@medusajs/framework/utils"
import BrandsModuleService from "./service"

export const BRANDS_MODULE = "brands"

export default Module(BRANDS_MODULE, {
  service: BrandsModuleService,
})
