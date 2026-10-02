# 12 — Tailwind CSS 4.3.3 upgrade + design pass

## 1. Goal
Move to the latest stable Tailwind (4.3.3, as `AGENTS.md` requires v4), then compare every screen with the wireframes in both themes and fix the differences. The light/dark theme switcher stays.

## 2. Wireframe reference
`docs/wireframes/01–05`. The wireframes are dark only, so light theme is checked against `.bob/rules/02-design-system.md` (token table).
**Open questions:** none. The upgrade must not change any pixel values (same tokens, same spacing).

## 3. Component tree
No new components. `src/styles/global.css` (modify) replaces `tailwind.config.ts` (delete).

## 4. Files
| Path | Action | Purpose |
|---|---|---|
| `package.json` / lockfile | modify | `tailwindcss@4.3.3`, add `@tailwindcss/vite@4.3.3`; remove `autoprefixer` and `postcss` (v4 handles prefixing) |
| `vite.config.ts` | modify | Add the `@tailwindcss/vite` plugin |
| `postcss.config.js`, `tailwind.config.ts` | delete | Replaced by CSS-first config |
| `src/styles/global.css` | modify | `@import "tailwindcss"`, `@theme` (colours, spacing, font sizes, breakpoints), `@custom-variant dark` not needed (tokens switch via `data-theme`) |
| `src/**/*.tsx` | modify | Renamed v4 utilities (`flex-shrink-0` → `shrink-0`, …) and design fixes |

## 5. Data
None.

## 6. States
Unchanged. Verify skeletons, empty and error states still render with the right colours.

## 7. Responsive behaviour
Breakpoints keep the Carbon values: sm 320, md 672, lg 1056, xlg 1312, max 1584 (`--breakpoint-*`).

## 8. Accessibility
v4 changes the default `ring` width (3 → 1 px) and `outline-none` semantics. All focus styles use an explicit `ring-2`, so the 2 px focus ring stays; check it in both themes. Contrast checked in light theme.

## 9. Tests
Unit tests don't load CSS; run the full suite for regressions. Visual check in the browser on all screens at 1440 and 375 px, dark and light.

## 10. Risks & open questions
- v4's spacing scale is `n × 0.25rem`, but this project uses Carbon pixel names (`p-16` = 16 px). Keep them by defining every used spacing key explicitly in `@theme` (`--spacing-16: 1rem`, …).
- Removed/renamed utilities silently do nothing → grep for them after the upgrade.

## 11. Task checklist
- [x] Install packages, Vite plugin, CSS-first theme
- [x] Fix renamed utilities; build + visual diff against the pre-upgrade screenshots
- [x] Design pass per screen (dark + light)
- [x] Typecheck, lint, tests, browser check
