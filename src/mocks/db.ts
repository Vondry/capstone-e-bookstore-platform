/**
 * SIMULATED: in-memory backend state for MSW, persisted to localStorage so carts,
 * orders and sessions survive a page reload in development.
 *
 * Demo customer and orders come from shared/catalog/demo.json (test credentials for this app only).
 */

import type { Customer } from '../features/auth/types';
import type { Address, PaymentMethod } from '../features/checkout/types';
import type { Order } from '../features/orders/types';
import { computeTotals, pointsEarned } from '../features/checkout/lib/totals';
import { seedDemo } from '@shared/catalog';
import { mockBooks } from './data/books';

export type CartRecord = {
  id: string;
  /** Like Medusa's `cart.customer_id`: set when created while logged in, or by a transfer */
  customerId: string | null;
  lines: { id: string; bookId: string; quantity: number }[];
  couponCode: string | null;
  redeemPoints: boolean;
  email: string | null;
  shippingAddress: Address | null;
  /** Set by POST /store/carts/:id/shipping-methods (Medusa only charges delivery once chosen) */
  hasShippingMethod: boolean;
  paymentCollectionId: string | null;
  hasPaymentSession: boolean;
  paymentMethod: PaymentMethod | null;
  completed: boolean;
};

export type OrderRecord = Order & {
  customerId: string | null;
  cancellationRequestedAt?: string;
};

export type CustomerRecord = Customer & { password: string };

type Db = {
  carts: Record<string, CartRecord>;
  orders: OrderRecord[];
  customers: CustomerRecord[];
  nextOrderNumber: number;
};

// Bump when the record shapes change, so stale data saved by an older version is ignored
const STORAGE_KEY = 'bw.mockdb.v3';
const HOUR = 60 * 60 * 1000;

export const DEMO_EMAIL = seedDemo.customer.email;
export const DEMO_PASSWORD = seedDemo.customer.password;

const demoAddress: Address = seedDemo.address;

function seedOrder(
  displayId: number,
  createdAt: Date,
  handles: string[],
  customerId: string,
  paymentMethod: Order['paymentMethod']
): Order & { customerId: string } {
  const books = handles.map((handle) => {
    const book = mockBooks.find((b) => b.handle === handle);
    if (!book) throw new Error(`Unknown seed book ${handle}`);
    return book;
  });
  const totals = computeTotals({
    lines: books.map((book) => ({
      unitPrice: book.priceInr,
      quantity: 1,
      isDigital: book.format === 'eBook',
    })),
    couponCode: null,
    redeemPoints: false,
    availablePoints: 0,
  });
  return {
    id: `order_seed_${String(displayId)}`,
    displayId,
    createdAt: createdAt.toISOString(),
    status: 'placed',
    email: DEMO_EMAIL,
    lines: books.map((book, i) => ({
      id: `ol_${String(displayId)}_${String(i)}`,
      book,
      quantity: 1,
      unitPriceInr: book.priceInr,
    })),
    totals,
    pointsEarned: pointsEarned(totals.total),
    shippingAddress: demoAddress,
    paymentMethod,
    customerId,
  };
}

function seed(now = Date.now()): Db {
  const customerId = 'cus_demo';
  return {
    carts: {},
    customers: [
      {
        id: customerId,
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        firstName: seedDemo.customer.firstName,
        lastName: seedDemo.customer.lastName,
        savedAddress: demoAddress,
        giftPoints: seedDemo.customer.giftPoints,
      },
    ],
    // #1002 is inside the 48 h cancel window, #1001 can only be bought again
    orders: seedDemo.orders.map((order) =>
      seedOrder(
        order.displayId,
        new Date(now - order.hoursAgo * HOUR),
        order.books,
        customerId,
        order.paymentMethod
      )
    ),
    nextOrderNumber: Math.max(...seedDemo.orders.map((order) => order.displayId)) + 1,
  };
}

function load(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    // Corrupt or unavailable storage: fall back to the seed
  }
  return seed();
}

export let db: Db = load();

export function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage unavailable: keep state in memory only
  }
}

/** Restores the seed data (used between tests) */
export function resetDb(now?: number): void {
  db = seed(now);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function customerFromRequest(request: Request): CustomerRecord | null {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token?.startsWith('mock-token-')) return null;
  const id = token.slice('mock-token-'.length);
  return db.customers.find((c) => c.id === id) ?? null;
}

export function toPublicCustomer({ password: _password, ...customer }: CustomerRecord): Customer {
  return customer;
}
