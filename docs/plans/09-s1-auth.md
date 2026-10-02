# 09 — S1 Login / Register (`/login`, `/register`) + header account menu

## Goal
Build the login and register screens and the header account menu so a customer can **1 Login** and **2 Authentication** (create an account, sign in, sign out), or skip both via "Continue as guest". After that they return to the page they came from (`?redirect=`).

## Wireframe reference
**File:** none — derived from `.bob/rules/02-design-system.md` and the S5 panel in `docs/wireframes/04-payment.png` (`03-screens.md` S1: "A centred panel like S5").

What S5 shows, and how S1 reuses it:
| S5 observation (wireframe 04) | S1 decision |
|---|---|
| Full-bleed book illustration behind a centred panel | Reuse `IllustratedBackground` (`components/ui/Illustration.tsx`, already documented as "S5 Payment, S6 Success, S1 Login") |
| Panel ≈ 490 px wide, `--layer-1` fill, square corners, no shadow | `max-w-[480px]` panel (closest round width; one form column needs less than S5's two), `bg-layer-1`, `rounded-none` (02: "Shape: square corners") |
| Header row: 20 px title left ("Complete Payment"), divider underneath | `<h1>` "Log in" / "Create account" at `text-20`, `border-b border-border`, padding 16 (02 spacing scale) |
| Inputs: label above in 12 px secondary text, `--layer-1`/darker fill, bottom border | Reuse `TextInput` (already implements the 02 "Inputs" rule). S5 shows inputs one step lighter than the panel, so inside the `layer-1` panel pass `className="bg-layer-2"` (Carbon's "field on layer" pattern) |
| Primary "Pay Now" button: blue, 48 px, label left, icon right, right-aligned in the panel | Primary `Button` with icon right (`ArrowRight`, 02 "Buttons"), full width of the form column (single-column form, so full width reads as the S5 right-aligned button) |
| Two-column field grid (Card Number / Name on Card) | Register: first + last name side by side ≥ md (02 breakpoints: md = 2 columns), stacked on sm. Login: single column |

Additional decisions (no source in the wireframe; each cites the rule it follows):
- Server error banner: inline `role="alert"` box above the submit button, `border-l-[3px] border-support-error bg-layer-2` with a Carbon `WarningFilled` 16 icon — mirrors the 3 px left bar used for the selected category (03 S2) and Carbon's inline notification; colour from `--support-error` (02 tokens).
- Password show/hide: a 48×48 icon button inside the input's right edge, `aria-pressed`, `aria-label="Show password"`, Carbon `View` / `ViewOff` 20 (02 "Icons", touch target ≥ 44 px).
- Secondary links ("Continue as guest", "New to Book Worm? Create an account", "Already have an account? Log in") in `text-14 text-link underline` (02 `--link`: "links (underlined)").
- Password rule shown as 12 px secondary helper text under the register password ("At least 8 characters"); replaced by the error when invalid.
- Demo hint ("Demo: reader@bookworm.test / bookworm123") only when `import.meta.env.DEV`, 12 px secondary text.
- Account menu: `bg-layer-1`, square, 1 px `border-border`, the only shadow allowed (02: "No drop shadows except on overlays"), items 48 px tall (touch target), hover `bg-layer-2`.

**Open questions** (decided here, documented as assumptions):
1. No "Forgot password" flow exists in the API → omitted.
2. Register has no "confirm password" field (not in the spec) → omitted; show/hide toggle covers typos.
3. "Continue as guest" goes to the redirect target (or `/`) without any API call; guests already work (01: "Guest checkout must work").
4. Register success: auto-logged in (the API stores the token) → toast "Welcome to Book Worm, {firstName}" and redirect.

## Component tree
- `LoginPage` (modify — `src/pages/LoginPage.tsx`)
  - `IllustratedBackground` (reuse)
  - `AuthPanel` (new) — panel shell: title row + body
    - `LoginForm` (new) — RHF + Zod, `useLogin` (reuse), `useToast` (reuse)
      - `TextInput` (reuse) e-mail
      - `PasswordInput` (new) — `TextInput` + toggle button
      - `FormAlert` (new) — server error
      - `Button` (reuse)
    - links: guest, register
- `RegisterPage` (modify) — same shell, `RegisterForm` (new) with `useRegister` (reuse)
- `Header` (modify) — `AccountMenu` (new) replaces the profile link
  - guest: `Link` to `/login?redirect=<current path>`
  - logged in: menu button + `role="menu"` with 2 `menuitem`s; `useCustomer`, `useLogout` (reuse)
- `useAuthRedirect` (new hook) — computes the safe target, redirects when already logged in, sets title

## Files
| Path | Action | Purpose |
|---|---|---|
| `docs/plans/09-s1-auth.md` | create | this plan |
| `src/features/auth/lib/redirect.ts` (+ test) | create | `safeRedirect(raw)`, `loginHref(path)` — open-redirect safe |
| `src/features/auth/lib/schemas.ts` (+ test) | create | `loginSchema`, `registerSchema`, `PASSWORD_MIN` |
| `src/features/auth/lib/errors.ts` (+ test) | create | `authErrorMessage(error, mode)` 401/409/other → copy |
| `src/features/auth/components/AuthPanel.tsx` | create | S5-style centred panel |
| `src/features/auth/components/PasswordInput.tsx` (+ test) | create | show/hide toggle |
| `src/features/auth/components/FormAlert.tsx` | create | inline server error |
| `src/features/auth/components/AuthFooter.tsx` | create | register/login switch link + "Continue as guest" |
| `src/features/auth/components/LoginForm.tsx` | create | login form |
| `src/features/auth/components/RegisterForm.tsx` | create | register form |
| `src/features/auth/components/useAuthRedirect.ts` | create | redirect target + already-logged-in redirect |
| `src/pages/LoginPage.tsx` (+ test) | modify/create | page, title "Log in · Book Worm" |
| `src/pages/RegisterPage.tsx` (+ test) | modify/create | page, title "Create account · Book Worm" |
| `src/components/layout/AccountMenu.tsx` (+ test) | create | guest link / account menu |
| `src/components/layout/Header.tsx` (+ test) | modify | use `AccountMenu`; tests use `renderWithProviders` |

## Data
- `useCustomer()` → `fetchCustomer` → `GET /store/customers/me` (Customer | null). Key `['customer']`.
- `useLogin()` → `login(email, password)` → `POST /auth/customer/emailpass` then `/store/customers/me`. 401 → wrong credentials.
- `useRegister()` → `register(input)` → `POST /auth/customer/emailpass/register` then `POST /store/customers` (Medusa's two-step flow). 409 → e-mail exists.
  Docs: https://docs.medusajs.com/resources/storefront-development/customers/register and …/login
- `useLogout()` → clears the token (client-side, SIMULATED session end — Medusa JWT has no server logout in this flow).
- All mocked by MSW (`src/mocks/handlers/auth.ts`). No new API code in this plan.

## States
| Part | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Customer check (page) | form renders immediately (guest default); redirect fires once `useCustomer` resolves to a customer | — | treated as guest (form stays usable) | logged in → `<Navigate replace>` to target |
| Login / register submit | button `loading`, disabled | — | `FormAlert` (401 "Incorrect e-mail or password." / 409 "An account with this e-mail already exists." / other "Something went wrong. Please try again."); resubmit = retry | toast, navigate to target |
| Field validation | — | — | inline error under field, `aria-describedby`, `aria-invalid` | — |
| Account menu | guest link while loading | — | guest link | name + items |

## Responsive behaviour
- sm (320+): panel full width minus 16 px gutters (`IllustratedBackground` `p-16`), register names stacked.
- md (672+): register first/last name in 2 columns; panel max 480 px centred.
- lg / xlg: unchanged (centred panel on the illustration, like S5).
- No horizontal scroll at 320 px; all controls ≥ 44 px tall.

## Accessibility
- Pages render inside PageShell's `<main>`; the panel is a `<section aria-labelledby>` with the `<h1>`.
- Every input has a visible `<label>`; errors linked by `aria-describedby` (via `TextInput`), helper text also linked.
- `noValidate` form so Zod messages (not browser bubbles) are shown; focus moves to the first invalid field (RHF `shouldFocusError`).
- Server error in `role="alert"`.
- Password toggle: `aria-pressed`, `aria-label="Show password"`, `aria-controls` the input.
- Autocomplete: `email`, `current-password`, `new-password`, `given-name`, `family-name`.
- Account menu: button `aria-haspopup="menu"` + `aria-expanded`; `role="menu"` / `menuitem`; opening focuses the first item; ↑/↓ wrap, Home/End; Esc closes and returns focus to the button; outside click closes.

## Tests
- Unit: `redirect.test.ts` (null/empty, "/", "/orders?x=1", "//evil.com", "/\\evil.com", "https://evil.com", "javascript:…", "orders" → "/"), `schemas.test.ts` (e-mail required/format, password required, register min 8, names required/trimmed), `errors.test.ts`.
- Component: `PasswordInput` toggles type + `aria-pressed`.
- Page (RTL + MSW): login success → `?redirect=/orders` route; wrong password → alert; blur validation; logged-in visit → redirect; guest link target; dev hint shown; register success → redirect; register 409 → alert; register password helper.
- Header/AccountMenu: guest link includes redirect; logged-in menu opens, shows name, arrow keys, Esc, outside click, logs out with toast and navigates to `/`.
- E2E: not in this task (golden path is guest checkout); TODO login journey spec.

## Risks & open questions
- The token lives in localStorage (`lib/http.ts`), readable by XSS; acceptable for the mock, revisit with Medusa session cookies.
- `useLogout` is synchronous and client-only.
- Five agents edit the repo concurrently; only owned files change.

## Task checklist
- [x] Pure libs: `redirect.ts`, `schemas.ts`, `errors.ts` + tests
- [x] `AuthPanel`, `FormAlert`, `PasswordInput` (+ test)
- [x] `LoginForm` + `LoginPage` (+ test)
- [x] `RegisterForm` + `RegisterPage` (+ test)
- [x] `AccountMenu` (+ test), `Header` integration, update `Header.test.tsx`
- [x] typecheck, lint, tests
