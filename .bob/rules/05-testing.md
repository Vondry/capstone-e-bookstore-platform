# 05 — Testing

## What must be tested
| Layer | Tool | Required coverage |
|---|---|---|
| Pure libs (`features/*/lib`) | Vitest | 100 % of branches: delivery estimate, gift points, cancel window, recommendations, price/tax totals, Zod schemas, Luhn check |
| UI primitives (`components/ui`) | Vitest + RTL | render, a11y role/label, keyboard interaction |
| Feature components | Vitest + RTL + MSW | loading → success, empty, error + retry |
| Golden path | Playwright | browse → product → add to cart → checkout → pay → success |
| Responsive | Playwright | golden path at **375×812**, **768×1024** and **1440×900**, with a screenshot per step |

## Rules
- Query by role and label (`getByRole`, `getByLabelText`). No test ids unless there is no accessible alternative.
- No snapshot tests of whole pages. Use Playwright screenshots for visual checks.
- Mock the network with MSW handlers from `src/mocks`. Never mock the hooks themselves.
- Use fake timers for time-based logic (48 h cancel window, delivery dates).
- When you fix a bug, add a test that fails without the fix first.
- After writing tests, **run them** and report pass/fail counts. Never claim tests pass without running them.
