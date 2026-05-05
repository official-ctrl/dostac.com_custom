# DOSTAC — Corporate Website + Admin CMS

## Overview

Full-stack DOSTAC corporate site (Korean cosmetic OEM/ODM) with multilingual public site and a Korean admin CMS. Built as a pnpm monorepo with strict OpenAPI-first contracts.

## Architecture

- **`artifacts/api-server`** — Express 5 API at `/api`. Drizzle/Postgres, Zod-validated routes, pino logging, cookie-session admin auth (bcrypt + secure HttpOnly cookie `dostac_admin_session`), Replit AI Integrations OpenAI proxy (`gpt-5.4`) for KO→en/ja/zh/vi auto-translate, Replit Object Storage (presigned URL upload), Gmail integration for inquiry alerts.
- **`artifacts/web`** — Public website at `/`. React + Vite + wouter. 6 pages: Home, About, Production, Products, Notices, Contact. i18n with 5 languages (ko/en/ja/zh/vi); language switcher in header. Pulls product/notice content from API.
- **`artifacts/admin`** — Admin CMS at `/admin/`. React + Vite. Self email/password login, Tiptap WYSIWYG, per-field/per-lang/all-fields "KO → translate" buttons, image upload via Replit Object Storage, dashboard + Products/Notices/Inquiries CRUD.
- **`lib/db`** — Drizzle schemas: `admin_users`, `products`, `product_translations`, `notices`, `notice_translations`, `contact_inquiries`, `banners`. Multilingual content stored as separate `*_translations` rows keyed by `lang`. `banners` uses denormalized columns (`titleKo/En/Ja/Zh/Vi` + `descriptionKo/...`) since it's a single-row payload.
- **`lib/api-spec`** — Single OpenAPI spec (`openapi.yaml`); orval generates `@workspace/api-zod` schemas + `@workspace/api-client-react` TanStack Query hooks.

## Stack

- **Monorepo**: pnpm workspaces, Node 24, TypeScript 5.9
- **Backend**: Express 5, Postgres + Drizzle, Zod, pino, bcryptjs
- **Frontend**: React 18 + Vite 7, TanStack Query v5, wouter, shadcn/ui, Tailwind, Tiptap (StarterKit + Underline + Link + Image + Placeholder)
- **AI translate**: Replit AI Integrations OpenAI proxy (`gpt-5.4`)
- **Email**: Replit `@replit/connectors-sdk` Gmail proxy → admin@dostac.co.kr
- **Storage**: Replit Object Storage (`@google-cloud/storage` via Replit sidecar)

## Admin

- URL: `/admin/`
- Email: `admin@dostac.co.kr`
- Password: `dostac1234!`
- New inquiries trigger an email alert to `admin@dostac.co.kr` (fire-and-forget; visitor request always succeeds).

## Languages

- Korean (input/source), English, Japanese (日本語), Chinese (中文), Vietnamese (Tiếng Việt)
- KO is the canonical source; admin can press "KO → 전체 번역" to fill the other four via OpenAI, with manual override per field.

## Key Commands

- `pnpm run typecheck` — full typecheck (libs first, then artifacts).
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client + Zod schemas after editing `lib/api-spec/openapi.yaml`.
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only).
- Run any artifact via its workflow (`artifacts/<name>: …`); never `pnpm dev` at the workspace root.

## Routes (high-level)

Public (`/api/public/*`): products, notices, contact-inquiries (POST), banners (active list).  
Admin (`/api/admin/*`, cookie-auth): auth (login/logout/me), products CRUD, notices CRUD, inquiries list/update, banners CRUD + reorder, translate, uploads/sign.  
Storage (`/api/storage/*`): `objects/*` and `public-objects/*` serve uploaded/public bucket files.

## Landing & layout (post-launch optimization phase 1)

- Header is slim: logo + nav + language switcher + "견적 문의" CTA.
- Footer is slim: copyright + Contact CTA only (no big 4-column block).
- Home page (`/`) is a full-screen banner slider only — banner image fills the viewport with overlaid Korean (or active language) title/description, dot indicators, prev/next arrows, 6s autoplay, optional `linkUrl` per banner. Banners managed in admin at `/admin/banners` with drag-style up/down reorder, active toggle, image upload, and 5-language title/description (with KO→all auto-translate).
