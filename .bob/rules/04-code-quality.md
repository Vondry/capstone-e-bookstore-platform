# 04 — Code Quality

## TypeScript & React
- `strict: true`. No `any`. No `// @ts-ignore`. Use `unknown` plus narrowing instead.
- Function components with named exports. Props types are named `{Component}Props`.
- Components stay under about 150 lines. Extract sub-components or hooks when they grow larger.
- No business logic in components. Put it in `features/*/lib` (pure) or hooks.
- Derive state instead of duplicating it. No `useEffect` for derived values.
- Lists use stable keys (ids, not indexes).
- Lazy-load routes (`React.lazy`) except Home.

## Styling
- Tailwind utilities with design tokens only (see 02). No inline `style={{}}` except dynamic values (e.g. widths).
- Use the `cn()` helper (clsx + tailwind-merge) for conditional classes.
- Order classes with `prettier-plugin-tailwindcss`.
- If the same class string appears 3 or more times, extract a component, not an `@apply`.

## Naming
- Components `PascalCase.tsx`, hooks `useCamelCase.ts`, pure libs `camelCase.ts`, tests `*.test.ts(x)` next to the file.
- Routes and URL params in kebab-case. Query keys are arrays: `['books', 'list', filters]`.

## Forms
- React Hook Form + Zod resolver. The schema lives in `features/*/lib/schemas.ts` and is unit-tested.
- Validate on blur, re-validate on change after the first error. Disable submit while submitting.

## Errors & states
- Every query/mutation in the UI handles **loading**, **empty**, **error** (with retry) and **success**.
- Use a global error boundary per route. Use toasts for mutation feedback (add to cart, buy again).

## Security & privacy
- Never log or persist card number, CVV or expiry.
- Secrets come only from `import.meta.env.VITE_*`, and `.env` is gitignored.
- No `dangerouslySetInnerHTML`.

## Dependencies
- Ask before adding any package. Prefer platform APIs (`Intl`, `URLSearchParams`, `crypto.randomUUID`).
