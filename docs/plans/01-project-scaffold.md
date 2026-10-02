# 01 — Project Scaffold

## Goal
Set up the initial Vite + React + TypeScript project with all required dependencies, tooling configuration, and folder structure per AGENTS.md and `.bob/rules/01-stack-and-architecture.md`.

## Wireframe reference
N/A — This is infrastructure setup.

## Packages and Versions

### Core Framework
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "vite": "^6.0.0",
  "typescript": "^5.6.0"
}
```

### Routing & State Management
```json
{
  "react-router-dom": "^6.26.0",
  "@tanstack/react-query": "^5.56.0",
  "@tanstack/react-query-devtools": "^5.56.0"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.0",
  "@hookform/resolvers": "^3.9.0"
}
```

### Styling
```json
{
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.5.0"
}
```

**Note:** Tailwind v3 is used for utility classes and responsive design. The main UI components follow IBM Carbon Design System principles (colors, spacing, typography from `02-design-system.md`). We build custom components styled with Tailwind utilities that match Carbon's g100 theme.

### Backend Integration
```json
{
  "@medusajs/js-sdk": "^2.0.0"
}
```

### Icons & Fonts
```json
{
  "@carbon/icons-react": "^11.47.0",
  "@fontsource/ibm-plex-sans": "^5.1.0"
}
```

### Testing
```json
{
  "vitest": "^2.1.0",
  "@vitest/ui": "^2.1.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.5.0",
  "@testing-library/user-event": "^14.5.0",
  "jsdom": "^25.0.0",
  "@playwright/test": "^1.47.0"
}
```

### Mocking
```json
{
  "msw": "^2.4.0"
}
```

### Linting & Formatting
```json
{
  "eslint": "^9.11.0",
  "@eslint/js": "^9.11.0",
  "typescript-eslint": "^8.7.0",
  "eslint-plugin-react": "^7.36.0",
  "eslint-plugin-react-hooks": "^5.1.0-rc",
  "eslint-plugin-react-refresh": "^0.4.12",
  "prettier": "^3.3.0",
  "prettier-plugin-tailwindcss": "^0.6.6"
}
```

### Type Definitions
```json
{
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  "@types/node": "^22.5.0"
}
```

## Component tree
N/A — This plan covers infrastructure only.

## Files

| Path | Action | Purpose |
|------|--------|---------|
| `package.json` | create | Project manifest with all dependencies and scripts |
| `tsconfig.json` | create | TypeScript strict config |
| `tsconfig.node.json` | create | TypeScript config for Vite config files |
| `vite.config.ts` | create | Vite config with React plugin and test setup |
| `tailwind.config.ts` | create | Tailwind v3 config extending design tokens |
| `postcss.config.js` | create | PostCSS config with Tailwind and Autoprefixer |
| `eslint.config.js` | create | ESLint flat config with React rules |
| `.prettierrc` | create | Prettier config with Tailwind plugin |
| `.prettierignore` | create | Ignore build outputs |
| `playwright.config.ts` | create | Playwright config for e2e tests |
| `.gitignore` | create | Ignore node_modules, dist, .env, coverage, test outputs |
| `.env.example` | create | Template for environment variables |
| `vitest.config.ts` | create | Vitest config extending Vite config |
| `src/main.tsx` | create | React entry point |
| `src/App.tsx` | create | Root component placeholder |
| `src/vite-env.d.ts` | create | Vite client types |
| `index.html` | create | HTML entry point |
| `src/app/` | create | Router, providers, root layout (empty for now) |
| `src/components/ui/` | create | Design system primitives (empty for now) |
| `src/components/layout/` | create | Header, Footer, etc (empty for now) |
| `src/features/` | create | Feature modules (empty for now) |
| `src/lib/` | create | Shared utilities (empty for now) |
| `src/mocks/` | create | MSW handlers (empty for now) |
| `src/styles/tokens.css` | create | Design tokens as CSS variables |
| `src/styles/global.css` | create | Global styles and Tailwind imports |
| `tests/e2e/` | create | Playwright tests (empty for now) |
| `public/` | create | Static assets |

## Data
N/A — No data layer in this scaffold step.

## States
N/A — No UI states in this scaffold step.

## Responsive behaviour
N/A — No UI in this scaffold step.

## Accessibility
N/A — No UI in this scaffold step.

## Tests
- Verify `npm install` completes without errors
- Verify `npm run dev` starts the dev server
- Verify `npm run typecheck` passes
- Verify `npm run lint` passes
- Verify `npm test` runs (even with no tests yet)
- Verify `npm run test:e2e` runs (even with no tests yet)

## Risks & open questions
1. **React 19**: Still in RC. May need to use `^18.3.0` if 19 is not stable yet. Check npm registry.
2. **Medusa SDK version**: Need to confirm the exact v2 SDK version that matches the backend.
3. **ESLint 9**: Uses flat config format. Ensure compatibility with all plugins.
4. **Environment variables**: Need to confirm the exact env vars needed (Medusa URL, publishable key).
5. **IBM Carbon integration**: Confirm we're not installing Carbon React components, only using design tokens and icons.

## Task checklist
- [ ] Initialize Vite React TypeScript project (`npm create vite@latest . -- --template react-ts`)
- [ ] Install all production dependencies
- [ ] Install all dev dependencies
- [ ] Configure TypeScript with strict mode
- [ ] Configure Tailwind CSS v3 with PostCSS
- [ ] Set up ESLint with flat config and React rules
- [ ] Set up Prettier with Tailwind plugin
- [ ] Configure Vitest for unit/component tests
- [ ] Configure Playwright for e2e tests
- [ ] Create folder structure per architecture rules
- [ ] Create `src/styles/tokens.css` with design system variables
- [ ] Create `src/styles/global.css` with Tailwind imports
- [ ] Set up MSW for API mocking
- [ ] Create `.env.example` with required variables
- [ ] Update `.gitignore` for all build outputs and secrets
- [ ] Add npm scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:e2e`
- [ ] Verify all commands run successfully
- [ ] Create initial commit with scaffold

---

## Notes
- This scaffold creates the foundation. No UI components or features yet.
- After approval, switch to **code mode** to implement.
- The next plan (02) will cover the design system tokens and UI primitives.
