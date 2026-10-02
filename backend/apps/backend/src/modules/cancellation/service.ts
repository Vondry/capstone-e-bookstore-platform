import { MedusaService } from "@medusajs/framework/utils"
import { CancellationRequest } from "./models/cancellation-request"

export const CANCEL_WINDOW_HOURS = 48

class CancellationModuleService extends MedusaService({ CancellationRequest }) {}

export default CancellationModuleService
