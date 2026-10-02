/**
 * Book Worm seed (plan docs/plans/14-backend-medusa.md, data model docs/data-model.md).
 * Runs once, automatically, as part of `medusa db:migrate`. Reset with `docker compose down -v`.
 *
 * Creates: store (INR), region "India" (+ Nepal, Bhutan, Sri Lanka) with 12 % GST, sales channel
 * and publishable key, a warehouse and the "Standard delivery" option (₹40, free from ₹499
 * before discounts, priced by src/modules/bookworm-delivery, GST-exempt), coupons BOOKWORM100 / READMORE10,
 * the 24 books from shared/catalog, writers and publishers (Brands module) linked to products,
 * the demo customer with a saved address, 120 gift points (Loyalty module), demo reviews,
 * and demo orders #1001/#1002 (Cancellation module 48h flow).
 */

import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCustomerAccountWorkflow,
  createCustomerAddressesWorkflow,
  createOrderWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createProductTagsWorkflow,
  createProductTypesWorkflow,
  createPromotionsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRatesWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { makeAvatar, makeCover } from "../lib/artwork"
import { COUNTRY_CODES, loadSharedCatalog } from "../lib/catalog"
import { STANDARD_OPTION_ID } from "../modules/bookworm-delivery/service"
import { BRANDS_MODULE } from "../modules/brands"
import type BrandsModuleService from "../modules/brands/service"
import { LOYALTY_MODULE } from "../modules/loyalty"
import type LoyaltyModuleService from "../modules/loyalty/service"
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"
import type ProductReviewModuleService from "../modules/product-review/service"

const COUNTRIES = Object.values(COUNTRY_CODES)
const CURRENCY = "inr"
const GST_RATE = 12
/** `${identifier}_${id}` of the provider registered in medusa-config.ts */
const DELIVERY_PROVIDER_ID = "bookworm-delivery_bookworm"

// Fixed dates: "New Launches" are the newest products (same order as the frontend mocks)
const CATALOGUE_DATE = Date.UTC(2026, 0, 1)
const LAUNCH_DATE = Date.UTC(2026, 8, 1)
const DAY = 24 * 60 * 60 * 1000

export default async function bookworm_seed({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillment = container.resolve(ModuleRegistrationName.FULFILLMENT)
  const productModule = container.resolve(Modules.PRODUCT)
  const auth = container.resolve(Modules.AUTH)
  const catalog = loadSharedCatalog()

  // ── Store, sales channel, publishable key ────────────────────────────────
  logger.info("Book Worm seed: store and sales channel…")
  const {
    result: [salesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [{ name: "Book Worm web store", description: "bookworm frontend" }],
    },
  })

  const {
    result: [publishableKey],
  } = await createApiKeysWorkflow(container).run({
    input: { api_keys: [{ title: "Book Worm storefront", type: "publishable", created_by: "" }] },
  })
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableKey.id, add: [salesChannel.id] },
  })

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Book Worm",
          supported_currencies: [{ currency_code: CURRENCY, is_default: true }],
          default_sales_channel_id: salesChannel.id,
        },
      ],
    },
  })

  // ── Region and tax ────────────────────────────────────────────────────────
  logger.info("Book Worm seed: region India (INR) and 12 % GST…")
  const {
    result: [region],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "India",
          currency_code: CURRENCY,
          countries: COUNTRIES,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })

  const { result: taxRegions } = await createTaxRegionsWorkflow(container).run({
    input: COUNTRIES.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
      default_tax_rate: { rate: GST_RATE, code: "GST", name: `GST ${GST_RATE} %` },
    })),
  })

  // ── Warehouse and delivery ────────────────────────────────────────────────
  logger.info("Book Worm seed: warehouse and delivery…")
  const {
    result: [warehouse],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Bengaluru warehouse",
          address: { city: "Bengaluru", country_code: "IN", address_1: "" },
        },
      ],
    },
  })
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: warehouse.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: DELIVERY_PROVIDER_ID },
  })

  // Created by a core migration: used for physical books. eBooks get no profile, so they need no delivery.
  const {
    data: [shippingProfile],
  } = await query.graph({ entity: "shipping_profile", fields: ["id"] })

  const fulfillmentSet = await fulfillment.createFulfillmentSets({
    name: "Book Worm delivery",
    type: "shipping",
    service_zones: [
      {
        name: "India and neighbours",
        geo_zones: COUNTRIES.map((country_code) => ({ country_code, type: "country" as const })),
      },
    ],
  })
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: warehouse.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })

  // Price calculated by the delivery provider: ₹40, free from ₹499 before discounts
  const {
    result: [standardDelivery],
  } = await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard delivery",
        price_type: "calculated",
        provider_id: DELIVERY_PROVIDER_ID,
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: { label: "Standard", description: "Delivered in 3 business days.", code: "standard" },
        data: { id: STANDARD_OPTION_ID },
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })

  // Delivery is GST-exempt, so the Grand Total shows a flat ₹40 (wireframe 03)
  await createTaxRatesWorkflow(container).run({
    input: taxRegions.map((taxRegion) => ({
      tax_region_id: taxRegion.id,
      name: "Delivery (GST exempt)",
      code: "GST-0-DELIVERY",
      rate: 0,
      rules: [{ reference: "shipping_option", reference_id: standardDelivery.id }],
    })),
  })

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: warehouse.id, add: [salesChannel.id] },
  })

  // ── Coupons ───────────────────────────────────────────────────────────────
  logger.info("Book Worm seed: coupons…")
  await createPromotionsWorkflow(container).run({
    input: {
      promotionsData: [
        {
          code: "BOOKWORM100",
          type: "standard",
          status: "active",
          application_method: {
            type: "fixed",
            target_type: "order",
            allocation: "across",
            value: 100,
            currency_code: CURRENCY,
          },
          // Minimum order ₹300 (numeric rules can't be made in the Admin UI)
          rules: [{ attribute: "item_subtotal", operator: "gte", values: "300" }],
        },
        {
          code: "READMORE10",
          type: "standard",
          status: "active",
          application_method: {
            type: "percentage",
            target_type: "order",
            allocation: "across",
            value: 10,
          },
        },
      ],
    },
  })

  // ── Catalogue ─────────────────────────────────────────────────────────────
  logger.info(`Book Worm seed: ${catalog.books.length} books…`)
  const { result: categories } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: catalog.categories.map(({ handle, name }) => ({
        handle,
        name,
        is_active: true,
      })),
    },
  })
  const categoryId = (handle: string) => {
    const found = categories.find((category) => category.handle === handle)
    if (!found) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Unknown category ${handle}`)
    return found.id
  }

  const formats = [...new Set(catalog.books.map((book) => book.format))]
  const { result: types } = await createProductTypesWorkflow(container).run({
    input: { product_types: formats.map((value) => ({ value })) },
  })
  const languages = [...new Set(catalog.books.map((book) => book.language))]
  const { result: tags } = await createProductTagsWorkflow(container).run({
    input: { product_tags: languages.map((value) => ({ value })) },
  })

  const writerName = (slug: string) =>
    catalog.writers.find((writer) => writer.slug === slug)?.name ?? slug

  await createProductsWorkflow(container).run({
    input: {
      products: catalog.books.map((book) => {
        const cover = makeCover(book.title, writerName(book.author), book.cover[0], book.cover[1])
        return {
          title: book.title,
          subtitle: book.subtitle ?? null,
          handle: book.handle,
          description: book.description,
          status: ProductStatus.PUBLISHED,
          thumbnail: cover,
          images: [{ url: cover }],
          type_id: types.find((type) => type.value === book.format)?.id,
          tag_ids: tags.filter((tag) => tag.value === book.language).map((tag) => tag.id),
          category_ids: book.categories.map(categoryId),
          sales_channels: [{ id: salesChannel.id }],
          // eBooks have no shipping profile, so Medusa doesn't require delivery for them
          ...(book.format === "eBook" ? {} : { shipping_profile_id: shippingProfile.id }),
          metadata: {
            rating: book.rating,
            sold_count: book.soldCount,
            // Medusa returns categories unordered; the frontend restores this order
            category_handles: book.categories,
            writer_slug: book.author,
            publisher_slug: book.publisher,
          },
          options: [{ title: "Format", values: [book.format] }],
          variants: [
            {
              title: book.format,
              manage_inventory: false,
              options: { Format: book.format },
              prices: [{ amount: book.priceInr, currency_code: CURRENCY }],
            },
          ],
        }
      }),
    },
  })

  // Same created dates as the mocks: new launches newest, the rest in catalogue order
  const products = await productModule.listProducts(
    { handle: catalog.books.map((book) => book.handle) },
    { select: ["id", "handle"] }
  )
  const launches = catalog.books.filter((book) => book.isNewLaunch).map((book) => book.handle)
  await productModule.upsertProducts(
    products.map((product) => {
      const index = catalog.books.findIndex((book) => book.handle === product.handle)
      const launchIndex = launches.indexOf(product.handle)
      const time =
        launchIndex === -1 ? CATALOGUE_DATE + index * DAY : LAUNCH_DATE + (3 - launchIndex) * DAY
      return { id: product.id, created_at: new Date(time) } as { id: string }
    })
  )

  // ── Brands: writers, publishers and product links ───────────────────────
  logger.info(`Book Worm seed: ${catalog.writers.length} writers and ${catalog.publishers.length} publishers…`)
  const brands: BrandsModuleService = container.resolve(BRANDS_MODULE)
  const writers = await brands.createWriters(
    catalog.writers.map((writer) => ({
      slug: writer.slug,
      name: writer.name,
      bio: writer.bio,
      avatar_url: makeAvatar(writer.name),
    }))
  )
  const publishers = await brands.createPublishers(
    catalog.publishers.map((publisher) => ({
      slug: publisher.slug,
      name: publisher.name,
      description: publisher.description,
    }))
  )

  const writerLinks: Array<{ [key: string]: Record<string, string> }> = []
  const publisherLinks: Array<{ [key: string]: Record<string, string> }> = []
  for (const book of catalog.books) {
    const product = products.find((p) => p.handle === book.handle)
    const writer = writers.find((w) => w.slug === book.author)
    const publisher = publishers.find((pub) => pub.slug === book.publisher)
    if (product && writer) {
      writerLinks.push({
        [Modules.PRODUCT]: { product_id: product.id },
        [BRANDS_MODULE]: { writer_id: writer.id },
      })
    }
    if (product && publisher) {
      publisherLinks.push({
        [Modules.PRODUCT]: { product_id: product.id },
        [BRANDS_MODULE]: { publisher_id: publisher.id },
      })
    }
  }
  await link.create([...writerLinks, ...publisherLinks])

  // ── Demo customer ─────────────────────────────────────────────────────────
  logger.info("Book Worm seed: demo customer…")
  const { customer, address } = catalog.demo
  const { authIdentity, error } = await auth.register("emailpass", {
    body: { email: customer.email, password: customer.password },
  })
  if (!authIdentity) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Could not register the demo customer: ${error ?? "unknown"}`
    )
  }

  const { result: demoCustomer } = await createCustomerAccountWorkflow(container).run({
    input: {
      authIdentityId: authIdentity.id,
      customerData: {
        email: customer.email,
        first_name: customer.firstName,
        last_name: customer.lastName,
      },
    },
  })
  await createCustomerAddressesWorkflow(container).run({
    input: {
      addresses: [
        {
          customer_id: demoCustomer.id,
          first_name: address.firstName,
          last_name: address.lastName,
          address_1: address.address,
          city: address.city,
          postal_code: address.pin,
          province: address.state,
          country_code: COUNTRY_CODES[address.country] ?? "in",
          phone: `${address.phoneCountryCode} ${address.phone}`,
          is_default_shipping: true,
          is_default_billing: true,
        },
      ],
    },
  })

  // ── Loyalty points ────────────────────────────────────────────────────────
  logger.info("Book Worm seed: demo customer gift points…")
  const loyalty: LoyaltyModuleService = container.resolve(LOYALTY_MODULE)
  await loyalty.createLoyaltyPoints({
    customer_id: demoCustomer.id,
    points: customer.giftPoints,
  })

  // ── Product reviews ───────────────────────────────────────────────────────
  logger.info("Book Worm seed: initial reviews…")
  const reviews: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
  const focusProd = products.find((p) => p.handle === "the-art-of-focus")
  if (focusProd) {
    await reviews.createReviews({
      product_id: focusProd.id,
      customer_id: demoCustomer.id,
      first_name: customer.firstName,
      last_name: customer.lastName,
      rating: 5,
      content: "Clear and actionable advice on staying focused in a noisy world. Highly recommended!",
      status: "approved",
    })
  }
  const midnightProd = products.find((p) => p.handle === "the-midnight-hour")
  if (midnightProd) {
    await reviews.createReviews({
      product_id: midnightProd.id,
      customer_id: demoCustomer.id,
      first_name: customer.firstName,
      last_name: customer.lastName,
      rating: 4,
      content: "Thrilling and kept me guessing until the very end. A fast, enjoyable page-turner.",
      status: "approved",
    })
  }

  // ── Demo orders (#1001 and #1002) ─────────────────────────────────────────
  logger.info("Book Worm seed: demo orders…")
  const fullProducts = await productModule.listProducts(
    { handle: catalog.books.map((b) => b.handle) },
    { relations: ["variants"] }
  )

  const pgConnection = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any
  try {
    await pgConnection.raw("SELECT setval('order_display_id_seq', 1000, false)")
  } catch {
    // Sequence may have another name or not exist
  }

  // Sort by hoursAgo descending: #1001 (240h ago) created first, then #1002 (2h ago)
  const demoOrders = [...catalog.demo.orders].sort((a, b) => b.hoursAgo - a.hoursAgo)
  for (const orderSpec of demoOrders) {
    const orderItems = orderSpec.books.map((handle) => {
      const book = catalog.books.find((b) => b.handle === handle)!
      const prod = fullProducts.find((p) => p.handle === handle)!
      const variant = prod.variants?.[0]
      return {
        title: book.title,
        quantity: 1,
        unit_price: book.priceInr,
        variant_id: variant?.id,
      }
    })

    const { result: createdOrder } = await createOrderWorkflow(container).run({
      input: {
        region_id: region.id,
        customer_id: demoCustomer.id,
        email: customer.email,
        currency_code: CURRENCY,
        sales_channel_id: salesChannel.id,
        shipping_address: {
          first_name: address.firstName,
          last_name: address.lastName,
          address_1: address.address,
          city: address.city,
          postal_code: address.pin,
          province: address.state,
          country_code: COUNTRY_CODES[address.country] ?? "in",
          phone: `${address.phoneCountryCode} ${address.phone}`,
        },
        billing_address: {
          first_name: address.firstName,
          last_name: address.lastName,
          address_1: address.address,
          city: address.city,
          postal_code: address.pin,
          province: address.state,
          country_code: COUNTRY_CODES[address.country] ?? "in",
          phone: `${address.phoneCountryCode} ${address.phone}`,
        },
        items: orderItems,
        metadata: { payment_method: orderSpec.paymentMethod },
      },
    })

    const orderCreatedAt = new Date(Date.now() - orderSpec.hoursAgo * 60 * 60 * 1000)
    try {
      await pgConnection.raw('UPDATE "order" SET created_at = ?, display_id = ? WHERE id = ?', [
        orderCreatedAt,
        orderSpec.displayId,
        createdOrder.id,
      ])
    } catch {
      // Fallback
    }
  }

  try {
    await pgConnection.raw("SELECT setval('order_display_id_seq', 1002, true)")
  } catch {
    // Fallback
  }

  logger.info(
    [
      "Book Worm seed finished. For the frontend run `npm run live:env` (writes .env.live.local):",
      "  VITE_API_MODE=live",
      `  VITE_MEDUSA_PUBLISHABLE_KEY=${publishableKey.token}`,
      `  VITE_MEDUSA_REGION_ID=${region.id}`,
    ].join("\n")
  )
}
