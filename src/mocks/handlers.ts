/**
 * MSW request handlers
 */

import { authHandlers } from './handlers/auth';
import { bookHandlers } from './handlers/books';
import { cartHandlers } from './handlers/cart';
import { orderHandlers } from './handlers/orders';
import { reviewHandlers } from './handlers/reviews';
import { writerHandlers } from './handlers/writers';

export const handlers = [
  ...bookHandlers,
  ...cartHandlers,
  ...orderHandlers,
  ...authHandlers,
  ...writerHandlers,
  ...reviewHandlers,
];
