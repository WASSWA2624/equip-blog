# Equip Blog

`equip-blog` is a Next.js 16 editorial platform for publishing source-grounded medical equipment guides with an authenticated admin workspace, public locale-aware routes, Prisma persistence, and structured SEO outputs.

## Stack

- Next.js 16 App Router
- React 19
- styled-components
- Prisma + MariaDB
- Redux Toolkit for admin-only client state
- Vitest + ESLint

## Local setup

1. Copy `.env.template.txt` to `.env`.
2. Update the database, auth, media, WhatsApp advert, and secret values in `.env`.
3. Install dependencies with `npm install`.
4. Generate Prisma client with `npm run prisma:generate`.
5. Seed baseline data with `npm run prisma:seed`.
6. Start development with `npm run dev`.

The runtime reads `.env`. `.env.local` is not used as the primary configuration source.

## Environment files

- Runtime file: `.env`
- Committed template: `.env.template.txt`

If startup fails validation, compare your `.env` against `.env.template.txt`.

Bootstrap admin defaults in the template are `admin@admin.com` / `admin`. They are intended for first-run bootstrap only and should be changed before any shared or production deployment.

## Useful commands

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run prisma:validate`
- `npm run prisma:seed`

## Repository layout

- `src/app`: App Router routes, metadata, sitemap, robots, and API handlers
- `src/components`: admin, public, layout, auth, and shared UI
- `src/features`: domain workflows for public rendering, SEO, auth, comments, posts, and media
- `src/lib`: environment validation, Prisma access, AI/research helpers, security, markdown, and storage
- `prisma`: schema, config, and seed logic

## Notes

- Public pages are locale-prefixed and currently ship English content under `/en`.
- Publishing remains an editorial action; generated drafts do not go live automatically.
- Search pages are intentionally crawlable for users but marked `noindex` and excluded from the sitemap.
