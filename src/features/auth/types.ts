import type { Address } from '../checkout/types';

export type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  savedAddress: Address | null;
  /** SIMULATED: gift points balance (customer metadata in Medusa) */
  giftPoints: number;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
