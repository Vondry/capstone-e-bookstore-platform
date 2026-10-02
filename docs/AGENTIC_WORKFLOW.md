# How I built Book Worm with agentic tools

A written companion to the capstone video. It explains which agentic tools I used, how I steered
them, which decisions stayed with me, and how I verified their output. Details per step are in
`docs/plans/` and `docs/AI_WORKFLOW.md`.

## 1. Terms

| Term | Meaning in this project |
|---|---|
| **Agentic IDE** | A code editor with an AI agent that does more than autocomplete: it reads the project, writes a plan, edits many files, runs commands (tests, linters) and reports back. I steer it with context, approvals and reviews. |
| **IBM Bob** | IBM's agentic IDE. My main tool for plans 01–14: scaffold, screens, tests and the Medusa backend. |
| **Plan mode / Code mode** | Bob's modes. In Plan mode it may only write a plan (`docs/plans/NN-*.md`) and must stop for my approval. In Code (Agent) mode it implements the approved plan. |
| **Rules (`.bob/rules/`)** | Project instructions loaded into every Bob task: architecture, design tokens, screen specs, code quality, testing, git. |
| **`AGENTS.md`** | The short working agreement every agent reads first: stack, commands and the 7 working rules. |
| **Custom mode** | A Bob mode I defined myself. *UI Reviewer* (`.bob/custom_modes.yaml`) is read-only: it compares a screen with its wireframe and the rules, and can only write review reports. |
| **Slash command** | A reusable prompt, e.g. `/screen S3` (`.bob/commands/screen.md`): read the spec and wireframe, reuse components, write the plan, list open questions, stop. |
| **Claude Code** | Anthropic's agentic coding tool for the terminal. My second agent for plan 15: review of plans 01–14, testing against the live backend, CI pipeline, coverage and the git history. |
| **MSW (Mock Service Worker)** | Answers API calls in the browser with mock data, so the frontend runs and is tested without a backend. |
| **Medusa** | An open-source e-commerce backend (Node.js + PostgreSQL). The same frontend code runs against MSW (mock mode) or Medusa (live mode). |

## 2. The loop for every screen

```
/screen S3 ─► Plan mode: plan with open questions ─► I review, decide, approve
     ▲                                                        │
     │                                                        ▼
 next screen ◄─ commit + AI_WORKFLOW entry ◄─ verify: typecheck, lint, tests ◄─ Code mode implements
```

Rules that make the loop work (`AGENTS.md`): plan first for anything over 2 files and wait for
approval; one screen at a time; verify before reporting done; never invent APIs; no new dependencies
without asking; end every task with a summary.

## 3. Context I gave the agent

| Input | Why |
|---|---|
| `docs/wireframes/*.png`, `docs/architecture.png` | The visual and domain source of truth |
| `.bob/rules/02-design-system.md` | IBM Carbon tokens (colours, spacing, type), so the UI is consistent without me repeating it |
| `.bob/rules/03-screens.md` | A spec per screen (S1–S8) and "every screen has loading, empty, error states and a title" |
| `.bob/rules-plan/plan-format.md` | The same 11 plan sections every time: goal, wireframe, components, files, data, states, responsive, accessibility, tests, risks, checklist |
| `.bob/rules/05-testing.md`, `06-git-and-ai-log.md` | Test pyramid and viewports; commit and logging rules |

## 4. Decisions I made (steering)

| Situation | My decision | Where it's recorded |
|---|---|---|
| Wireframe 02 shows a back cover, but no book has one | Render the back cover only when it exists; no generated placeholder | Plan 05, open question 1 |
| Wireframe 02 shows a sample review by "John Smith" | No fake seeded reviews; show an empty state until a real review exists | Plan 05, open question 4 |
| Plan 01 chose Tailwind **v3**, but `AGENTS.md` requires v4 | Caught it; plan 12 upgraded to Tailwind 4 without changing any pixel value | Plans 01 and 12 |
| Where should the backend live? | In `backend/` of this repo: one GitHub link, one PR | Plan 14, D1 |
| Medusa's default port 9000 is taken by a local PHP-FPM | Port 9100 (configurable via `PORT`) | Plan 14, D4 |
| Reviews: browser-only or server? | Server-side, login required, auto-approved; the wishlist stays in the browser | Plan 14, D2 and D6 |
| The plan flagged that SDK responses were silently `any` | Approved adding `@medusajs/types` for a compile-time contract | Plan 14, Q4 → D5 |

## 5. AI mistakes caught, and how

| Mistake | Caught by |
|---|---|
| CORS origin missing port 5174 for the live E2E runner | Live E2E run (plan 14) |
| Seed order numbers off by one; an E2E test hard-coding order #1003 | Live E2E run (plan 14) |
| Free delivery from ₹499 can't be done with flat price rules (must be before discounts) | Testing against Medusa; replaced by a small fulfillment provider (plan 14) |
| A stale publishable key in `.env.live`: live mode failed on every screen | Running the whole E2E suite against live Medusa (Claude Code, plan 15) |
| Coupons typed in lower case failed only in live mode | Same; fixed and the mock made case-sensitive like Medusa |
| Choosing two filters quickly lost the first one | A flaky E2E test; reproduced in a unit test, then fixed |
| eBook-only carts were charged ₹40 delivery | Same; fixed with a new backend route plus regression tests |

Every fix came with a test that fails without it.

## 6. Verification and results

- **Static checks:** TypeScript strict, ESLint (SonarJS), Prettier, production build; backend typecheck and lint
- **Unit tests:** 453 (Vitest), coverage 95.9 % statements and 91.8 % branches, with a 90 % gate in CI; backend: 34 (Jest)
- **E2E tests (Playwright):** 69 against the mock API on desktop, iPhone 12 and iPad Pro; 57 against live Medusa on a freshly seeded PostgreSQL
- **CI:** `.github/workflows/ci.yml` runs all of the above on every push and pull request
- **History:** one conventional commit per plan, each verified before it was committed

## 7. What I learned

- Context beats prompts: rules and specs written once replace long prompts per task.
- Plan mode with forced open questions turns hidden assumptions into decisions I can make.
- Agents are confident: "done" means nothing until tests, the wireframe and the live backend agree.
