# Book Worm — Online Bookstore (AGENTS.md)

You are working on **Book Worm**, a responsive e-commerce frontend for a bookstore.
Customers browse books by category, writer and publisher, add them to a basket, check out,
pay and see their order history.

Detailed rules live in `.bob/rules/`. This file is the short overview.

## Source of truth
- Wireframes: `docs/wireframes/*.png`. Match their layout, hierarchy and copy.
- Screen specs: `.bob/rules/03-screens.md`.
- Architecture (domains): `docs/architecture.png`. Its domains are Member, Store, Catalog, Order, Payment and Shipping.
- Plans for each feature: `docs/plans/NN-<feature>.md`, written in Plan mode before any code.

## Stack (do not change without asking)
React 19 · Vite · TypeScript (strict) · Tailwind CSS v4 · React Router · TanStack Query v5 ·
React Hook Form + Zod · `@medusajs/js-sdk` (Medusa v2 backend on PostgreSQL) ·
`@carbon/icons-react` · IBM Plex Sans · Vitest + React Testing Library · Playwright · MSW (mocks)

## Commands
| Task | Command |
|---|---|
| Dev server | `npm run dev` (http://localhost:5173) |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Unit tests | `npm test` |
| E2E tests | `npm run test:e2e` |
| Backend (separate repo/folder) | Medusa at http://localhost:9000 |

## How to work in this repo (always)
1. **Plan first.** For any task touching more than 2 files, list the files to create or change and wait for approval.
2. **One screen or feature at a time.** Keep diffs small and reviewable.
3. **Verify before you report "done".** Run `npm run typecheck && npm run lint && npm test`, fix failures, then report the results.
4. **Never invent APIs.** If you are unsure of a Medusa SDK method or route, say so and ask for the docs URL.
5. **No new dependencies** without asking first.
6. **Don't edit** `.bob/`, `AGENTS.md` or `docs/wireframes/` unless explicitly asked.
7. **End every task with a summary:** files changed, assumptions, open TODOs, and a proposed entry for `docs/AI_WORKFLOW.md`.
