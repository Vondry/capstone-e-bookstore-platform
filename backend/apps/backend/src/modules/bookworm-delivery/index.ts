import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import BookwormDeliveryService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [BookwormDeliveryService],
})
