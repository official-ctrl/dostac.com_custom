---
name: Next.js Migration Findings (artifacts/web)
description: Concrete risks identified during pre-flight review of the Vite-to-Next.js 15 App Router migration plan.
type: project
---

Pre-flight review of the Next.js 15 App Router migration for `artifacts/web` (branch `feat/nextjs-migration`, dated 2026-06-07).

**Why:** The user submitted a detailed migration plan and requested implementation. Architect role is to surface risks BEFORE the executor writes code, so the executor does not waste cycles on plan defects.

**How to apply:** When this migration is revisited (by executor or planner), check whether these items have been addressed. They are not derivable from the current code state because they are gaps between the plan and reality.

Key risks found (see referenced file:line):
1. `next-themes ^0.4.6` is in proposed deps but not used anywhere in the codebase — should be removed unless someone plans to add dark mode.
2. `LanguageProvider` reads `window.localStorage` in `useState` initializer at `artifacts/web/src/components/dostac/i18n.tsx:2306-2310`. Safe under "use client" but will cause hydration mismatch if the server renders one lang and the client restores another — needs a post-mount effect pattern.
3. `setBaseUrl` in `getQueryClient` will leak server URLs across requests because `_baseUrl` is module-level in `lib/api-client-react/src/custom-fetch.ts:18`. Each Node.js process has one shared baseUrl — concurrent requests with different base URLs would corrupt each other. For Next.js server use, baseUrl needs to be set process-wide once at startup, not per-request.
4. `setBaseUrl` is called every request in proposed `get-query-client.ts` — should be moved to module init (e.g., instrumentation.ts or top of layout.tsx) since the module-level mutation persists.
5. `useRef(getQueryClient())` in proposed `providers.tsx` calls the function on every render before useRef accepts the initial value — should be `useState(() => getQueryClient())[0]` or `useRef<QueryClient | null>(null)` + lazy init to avoid recreating on re-renders.
6. `main.tsx:11-15` prefetches category/subcategory translations on bootstrap. Migration plan doesn't preserve this — Layout component depends on these queries being ready and may flash empty nav menus.
7. tsconfig `customConditions: ["workspace"]` in `tsconfig.base.json:23` plus `allowImportingTsExtensions` removal may break imports from `@workspace/api-client-react` which exports `./src/index.ts` directly.
8. Tailwind v4 + Next.js needs `@tailwindcss/postcss` package which is in deps, good. But `@tailwindcss/vite` is currently used at `vite.config.ts:3` — keep both during transition or strip vite-specific.
9. `useGoogleAnalytics()` updated hook uses `useSearchParams()` which requires Suspense boundary in App Router or it will opt entire page out of SSG. Plan doesn't mention Suspense wrapping.
10. `middleware.ts` matcher excludes paths with dots (`.*\\.`), but excludes `/favicon` literal — should be `/favicon.ico` and `/sitemap.xml`, `/robots.txt` explicitly. As written, sitemap requests may pass through middleware unnecessarily.
11. `index.css` import chain: plan keeps `src/index.css` and adds `globals.css`. Multiple Tailwind entry points cause duplicate CSS — pick one canonical entry.
12. `wouter` v3.9.0 (per node_modules) but `package.json:71` declares `^3.3.5` — proposed removal is correct, but verify no lingering imports in components beyond pages.
13. Catalog: pnpm-workspace uses `catalog:` references; proposed package.json uses both `catalog:` AND fixed versions inconsistently (e.g., `react` is catalog: but `@tailwindcss/typography` is `^0.5.15`). Keep convention consistent with admin/mockup-sandbox packages.
14. `dostac.css` import path in proposed globals.css uses `../components/dostac/dostac.css` — works only if globals.css is at `src/app/globals.css`. Verify path resolution.
15. Proposed redirects in `next.config.ts` duplicate routes already handled by `App.tsx:55-56` wouter `Redirect`. After migration, only middleware/next.config.ts redirects are active — verify no other code reads `/notice/*` paths.
