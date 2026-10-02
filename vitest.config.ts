import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      // Unit/integration tests only; Playwright specs in tests/e2e run via `npm run test:e2e`
      include: ['src/**/*.test.{ts,tsx}'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'html', 'lcov', 'json-summary'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          // Test doubles: the MSW "backend" is exercised by every test but isn't app code
          'src/mocks/**',
          'src/test/**',
          '**/*.test.{ts,tsx}',
          // Bootstrap only (starts MSW, mounts <App />); covered by the E2E suite
          'src/main.tsx',
          'src/vite-env.d.ts',
          '**/types.ts',
        ],
        // CI fails below 90 % (docs/plans/15-ci-and-coverage.md)
        thresholds: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
  })
);
