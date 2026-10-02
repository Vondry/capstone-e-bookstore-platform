---
description: Verify a route at mobile/tablet/desktop with Playwright screenshots and report issues
argument-hint: <route e.g. /checkout>
---
For the route given in the argument:

1. Make sure the dev server is running (`npm run dev`).
2. Create or update a Playwright spec in `tests/e2e/responsive/` that opens the route at
   375×812, 768×1024 and 1440×900, in both dark and light theme. Take a full-page screenshot
   per combination into `docs/screenshots/<route-name>/`.
3. In the same spec, assert: no horizontal overflow (`document.documentElement.scrollWidth <= innerWidth`),
   primary CTA visible, and no console errors.
4. Run it and report a table: viewport | theme | pass/fail | issue.
5. Compare the results with the responsive rules in `.bob/rules/02-design-system.md` and list the fixes needed.
   Do not apply fixes yet.
