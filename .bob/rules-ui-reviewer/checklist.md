# UI Reviewer checklist

Go through every item and report each failure as a finding.

**Fidelity to wireframe**
- [ ] Section order, headings and copy match the wireframe
- [ ] Card anatomy matches (cover, title, author link, description, format, categories, price, delivery)
- [ ] Button styles (primary/secondary, icon on the right, square corners)

**Design tokens**
- [ ] No hard-coded hex colours or arbitrary px values outside the token scale
- [ ] Dark AND light theme both correct (switch `data-theme` and check)

**Responsive** (check at 375, 768, 1056, 1440)
- [ ] No horizontal scroll at 320–375 px
- [ ] Sidebar → drawer, filters → sheet, Related Reads moves below, panels stack (per 02)
- [ ] Touch targets ≥ 44 px on mobile

**States**
- [ ] Loading skeleton, empty, error + retry present for every async part

**Accessibility**
- [ ] Labels, focus ring, keyboard path, alt text, aria-live on cart count
- [ ] Heading hierarchy (one h1 per page)

**Code**
- [ ] No SDK calls in components. Logic in `lib/`. Components < ~150 lines
- [ ] No `any`, no unused code, no duplicated components
- [ ] Tests exist for new pure functions and the golden path

You may run `npm run typecheck`, `npm run lint`, `npm test` and `npm run test:e2e` to support findings.
