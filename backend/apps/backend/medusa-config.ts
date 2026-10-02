import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    // Book Worm custom modules (plan 14, docs/data-model.md)
    { resolve: "./src/modules/brands" },
    { resolve: "./src/modules/loyalty" },
    { resolve: "./src/modules/cancellation" },
    { resolve: "./src/modules/product-review" },
    {
      resolve: "@medusajs/medusa/fulfillment",
      key: Modules.FULFILLMENT,
      options: {
        providers: [
          // Medusa's default, kept for returns and admin use
          { resolve: "@medusajs/medusa/fulfillment-manual", id: "manual" },
          // "Standard delivery": ₹40, free from ₹499 before discounts
          { resolve: "./src/modules/bookworm-delivery", id: "bookworm" },
        ],
      },
    },
  ],
})
