# PsxWorth

PsxWorth is an AI-powered portfolio tracker built for Pakistan Stock Exchange (PSX) investors. It helps users import transactions from broker or CDC statements, track portfolio performance, analyze sector and stock allocation, monitor payouts and corporate actions, and understand ETF exposure from one responsive web app.

## GitHub Description

AI-powered PSX portfolio tracker for Pakistan Stock Exchange investors with transaction import, returns analytics, payouts, and ETF exposure insights.

## Features

- AI-assisted transaction parsing for broker and CDC statements
- Portfolio tracking across multiple portfolios
- Real-time PSX pricing and performance analytics
- Historical returns charts and portfolio performance views
- Dividend, bonus, split, and right issue tracking
- Stock and sector allocation analysis
- ETF holdings breakdown and true exposure insights
- Responsive web experience with PWA support
- Clerk authentication and PostHog analytics

## Tech Stack

- `Next.js 16` with the App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `Clerk` for authentication
- `Drizzle ORM` with PostgreSQL
- `TanStack Query` and `TanStack Table`
- `PostHog` for product analytics

## Getting Started

### Prerequisites

- `Node.js 20+`
- `pnpm 8+`
- PostgreSQL databases for user and market/data storage
- Clerk and PostHog credentials

### Installation

```bash
pnpm install
```

### Environment Variables

Create a local environment file and add the required runtime values:

```bash
cp .env.example .env.local
```

Required runtime variables:

```env
AI_GATEWAY_API_KEY=
CLERK_SECRET_KEY=
DATA_DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
POSTHOG_ENV_ID=
POSTHOG_PERSONAL_API_KEY=
USER_DATABASE_URL=
```

### Run Locally

```bash
pnpm dev
```

The app runs with Next.js Turbopack and experimental HTTPS in development.

## Available Scripts

- `pnpm dev` - start the local development server
- `pnpm build` - create a production build
- `pnpm start` - run the production server
- `pnpm lint` - run ESLint
- `pnpm lint:types` - run TypeScript type checking
- `pnpm format` - format source files with Prettier
- `pnpm migrate:schema` - run schema migration script
- `pnpm db:user:generate` - generate Drizzle migrations for the user DB
- `pnpm db:user:migrate` - apply Drizzle migrations for the user DB
- `pnpm db:user:backfill` - migrate user data from Turso to PostgreSQL
- `pnpm db:user:studio` - open Drizzle Studio for the user DB

## Project Structure

```text
src/
  app/          Next.js routes, layouts, metadata, API routes
  actions/      Server actions and business logic
  components/   UI, home page sections, and feature components
  db/           Database clients and schema
  features/     Domain-specific feature modules
  lib/          Shared libraries and AI helpers
  utils/        Hooks, constants, formatting, and helpers
scripts/        Data and migration scripts
```

## Product Positioning

PsxWorth is focused on a very specific use case: helping PSX investors understand their actual portfolio performance, allocation, entitlements, and exposure without relying on spreadsheets or generic global investing apps. The standout differentiator is AI-assisted transaction import combined with PSX-specific analytics like corporate action tracking and ETF holdings visibility.

## Deployment

The app is configured for standalone Next.js output:

```bash
pnpm build
pnpm start
```

If you deploy to Vercel or another platform, make sure all environment variables above are configured for the target environment.
