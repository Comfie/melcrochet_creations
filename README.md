# MelCrochet Gifted Hands

Website for MelCrochet Gifted Hands, a handmade crochet business — product catalogue, storefront, and (in later plans) an admin area for managing products and orders.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma 7](https://www.prisma.io) + PostgreSQL ([Railway](https://railway.app))
- [Vitest](https://vitest.dev) for tests

## Getting started

1. Install dependencies (this also runs `prisma generate` via `postinstall`):

   ```bash
   npm install
   ```

2. Copy the env template and fill in your own values:

   ```bash
   cp .env.example .env
   ```

   At minimum, set `DATABASE_URL` to a Postgres connection string (a Railway pooled connection string in production).

3. Run migrations and seed the database:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the result.

## Other useful scripts

- `npm run build` — production build
- `npm test` — run the Vitest test suite
- `npm run db:studio` — open Prisma Studio
- `npm run db:reset` — reset the database (drops and re-applies migrations + seed)

## Docs

Architecture and planning docs live in `docs/superpowers/specs/`.
