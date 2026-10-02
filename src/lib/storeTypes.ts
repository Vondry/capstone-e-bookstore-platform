/**
 * Response shapes of the custom Book Worm store routes (docs/api/openapi.yaml), plus the
 * Medusa product extended with its Brands module links. Core routes use `HttpTypes` from
 * `@medusajs/types`. The MSW mocks are typed with these too, so they can't drift from the contract.
 */

import type { HttpTypes } from '@medusajs/types';

export type BrandRefDTO = { slug: string; name: string };

/** A product requested with `+writer.*,+publisher.*` (module links, plan 14) */
export type BookProductDTO = HttpTypes.StoreProduct & {
  writer?: BrandRefDTO | null;
  publisher?: BrandRefDTO | null;
};

export type WriterSummaryDTO = {
  slug: string;
  name: string;
  avatar_url: string;
  book_count: number;
};

export type WriterDTO = {
  slug: string;
  name: string;
  /** One entry per paragraph */
  bio: string[];
  avatar_url: string;
  /** The writer's books, to load with `product.list({ id })` */
  product_ids: string[];
};

export type PublisherSummaryDTO = {
  slug: string;
  name: string;
  description: string;
  book_count: number;
};

export type PublisherDTO = PublisherSummaryDTO & {
  product_ids: string[];
};

export type WritersResponse = { writers: WriterSummaryDTO[] };
export type WriterResponse = { writer: WriterDTO };
export type PublishersResponse = { publishers: PublisherSummaryDTO[] };
export type PublisherResponse = { publisher: PublisherDTO };
export type BestsellersResponse = { product_ids: string[] };

/** GET /store/customers/me/loyalty-points (Loyalty module) */
export type LoyaltyPointsResponse = { points: number };

// ── Cart and order wire types ────────────────────────────────────────────────
// Medusa's entity types include every relation (e.g. a line item's parent cart), which real
// responses only contain when requested. These pick exactly the fields Book Worm requests and
// reads, so names and types stay checked against `@medusajs/types` without inventing the rest.

type TotalsFields =
  | 'item_subtotal'
  | 'item_total'
  | 'tax_total'
  | 'shipping_total'
  | 'discount_total'
  | 'discount_tax_total'
  | 'total';

/** A promotion's share of a line item's discount */
export type AdjustmentDTO = { id: string; code?: string; amount: number; promotion_id?: string };

export type CartAddressDTO = Pick<
  HttpTypes.StoreCartAddress,
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'address_1'
  | 'city'
  | 'postal_code'
  | 'province'
  | 'country_code'
  | 'phone'
>;

export type CartLineDTO = Pick<
  HttpTypes.StoreCartLineItem,
  | 'id'
  | 'title'
  | 'thumbnail'
  | 'quantity'
  | 'unit_price'
  | 'product_id'
  | 'variant_id'
  | 'requires_shipping'
> & { adjustments?: AdjustmentDTO[] };

export type ShippingMethodDTO = Pick<
  HttpTypes.StoreCartShippingMethod,
  'id' | 'name' | 'amount' | 'shipping_option_id'
>;

export type CartDTO = Pick<
  HttpTypes.StoreCart,
  'id' | 'region_id' | 'email' | 'currency_code' | 'metadata' | TotalsFields
> & {
  items: CartLineDTO[];
  shipping_address?: CartAddressDTO | null;
  shipping_methods: ShippingMethodDTO[];
  promotions: { id: string; code?: string }[];
  payment_collection?: { id: string } | null;
};

export type CartResponse = { cart: CartDTO };

export type ShippingOptionDTO = { id: string; name: string; amount: number };

export type CancellationRequestDTO = {
  id: string;
  order_id: string;
  status: 'requested' | 'approved' | 'rejected';
  created_at: string;
};

export type OrderLineDTO = Pick<
  HttpTypes.StoreOrderLineItem,
  'id' | 'title' | 'thumbnail' | 'quantity' | 'unit_price' | 'product_id' | 'variant_id'
> & { adjustments?: AdjustmentDTO[] };

export type OrderDTO = Pick<
  HttpTypes.StoreOrder,
  | 'id'
  | 'display_id'
  | 'email'
  | 'status'
  | 'created_at'
  | 'currency_code'
  | 'metadata'
  | TotalsFields
> & {
  items: OrderLineDTO[];
  shipping_address: CartAddressDTO | null;
  /** Module link (Cancellation module), requested with `+cancellation_request.*` */
  cancellation_request?: CancellationRequestDTO | null;
};

export type OrderResponse = { order: OrderDTO };
export type OrdersResponse = { orders: OrderDTO[]; count: number; offset: number; limit: number };

export type CompleteCartResponse =
  | { type: 'order'; order: OrderDTO }
  | { type: 'cart'; cart: CartDTO; error: { message: string; name: string; type: string } };

/** POST /store/orders/{id}/cancel-request */
export type CancellationRequestResponse = { cancellation_request: CancellationRequestDTO };

export type ReviewDTO = {
  id: string;
  product_id: string;
  first_name: string;
  last_name: string;
  content: string;
  rating: number;
  created_at: string;
};

export type ReviewsResponse = {
  reviews: ReviewDTO[];
  count: number;
  average_rating: number | null;
};

export type CreateReviewResponse = {
  review: ReviewDTO;
};
