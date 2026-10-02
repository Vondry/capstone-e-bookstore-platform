# 02 — Design System (derived from wireframes, IBM Carbon "g100" look)

## Tokens — the only source of colour, spacing and type
Define the tokens as CSS variables in `src/styles/tokens.css` and expose them through Tailwind v4 `@theme`.
**Never hard-code hex values in components.**

| Token | Dark (default) | Light | Usage |
|---|---|---|---|
| `--bg` | #161616 | #ffffff | page background |
| `--layer-1` | #262626 | #f4f4f4 | cards, panels, inputs |
| `--layer-2` | #393939 | #e0e0e0 | selected nav item, hover |
| `--border` | #525252 | #c6c6c6 | dividers, input bottom border |
| `--text-primary` | #f4f4f4 | #161616 | |
| `--text-secondary` | #c6c6c6 | #525252 | descriptions, labels |
| `--text-placeholder` | #6f6f6f | #a8a8a8 | |
| `--link` | #78a9ff | #0f62fe | author, category links (underlined) |
| `--interactive` | #0f62fe | #0f62fe | primary button, active tab indicator |
| `--interactive-hover` | #0353e9 | #0353e9 | |
| `--button-secondary` | #6f6f6f | #393939 | "Add to Wishlist" |
| `--support-success` | #42be65 | #24a148 | purchase success icon |
| `--support-error` | #fa4d56 | #da1e28 | errors, cart badge |
| `--rating` | #f1c21b | #f1c21b | stars |
| `--focus` | #ffffff | #0f62fe | 2px focus ring |

- Theme: dark by default. Toggle with `data-theme="light|dark"` on `<html>`, respect `prefers-color-scheme` on first load, and persist the choice in localStorage. Both themes must look correct on every screen.
- Font: IBM Plex Sans (400/600) via `@fontsource/ibm-plex-sans`. Scale: 12 / 14 / 16 / 20 / 28 / 32 px.
- Spacing: 2, 4, 8, 12, 16, 24, 32, 40, 48 px only.
- Shape: **square corners** (radius 0), as in Carbon. No drop shadows except on overlays.
- Inputs: `--layer-1` fill, 1 px bottom border `--border`, label above in 12 px `--text-secondary`, height 40–48 px.
- Buttons: height 48 px, label left-aligned, icon right-aligned (Carbon style). Primary = `--interactive`, secondary = `--button-secondary`.
- Icons: `@carbon/icons-react` only, 16 or 20 px.
- Prices: `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` → "₹399". Totals in the order summary keep 2 decimals ("₹508.00").

## Breakpoints (Carbon grid) — mobile-first
| Name | Min width | Layout |
|---|---|---|
| sm | 320 | 1 column, 16 px gutters |
| md | 672 | 2 columns |
| lg | 1056 | category sidebar visible |
| xlg | 1312 | 3-column book grid |
| max | 1584 | content max-width |

## Responsive behaviour (required)
- **Header**: on < md, the nav links (My Orders / My Wishlist / My Writers) collapse into the menu icon on the left. Cart and profile icons always stay visible.
- **Category sidebar**: visible ≥ lg. Below lg it becomes a Drawer opened from a "Categories" button.
- **Filter bar** (search, language, format, price, sort): ≥ lg one row. md wraps into 2 rows. sm shows full-width search plus a "Filters" button that opens a bottom sheet.
- **Book card**: horizontal (cover left, text right) at every size. The cover is 120–144 px wide and keeps a 2:3 ratio.
- **Product detail**: "Related Reads" is a right column ≥ lg and moves below the reviews on smaller screens.
- **Cart/checkout**: the address form and Grand Total panel sit side by side ≥ lg and stack below that. The Grand Total panel is sticky on desktop.
- **Payment**: on sm, the vertical method tabs become a horizontal scrollable tab list above the form.
- No horizontal page scroll at 320 px. Touch targets are ≥ 44 px.

## Accessibility (WCAG 2.1 AA)
- Every input has a visible `<label>`. Errors are linked via `aria-describedby`.
- Visible 2 px focus ring on everything interactive. Full keyboard path through checkout.
- Covers have alt text: `"{title} by {author} — cover"`.
- Cart count changes are announced through an `aria-live="polite"` region.
- Respect `prefers-reduced-motion`.
- Contrast ≥ 4.5:1 for body text in both themes.
