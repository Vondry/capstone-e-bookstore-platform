/// <reference types="vite/client" />

// Vite's env types are extended by interface merging, so these must be interfaces
/* eslint-disable @typescript-eslint/consistent-type-definitions */
interface ImportMetaEnv {
  /** `mock` (default): MSW answers in the browser; `live`: the Medusa backend (plan 14) */
  readonly VITE_API_MODE?: string;
  readonly VITE_MEDUSA_URL?: string;
  readonly VITE_MEDUSA_PUBLISHABLE_KEY?: string;
  readonly VITE_MEDUSA_REGION_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
