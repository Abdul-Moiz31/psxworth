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

For full local setup instructions — including creating the two PostgreSQL databases, running migrations, and seeding the public market-data snapshot — see **[docs/local-setup.md](docs/local-setup.md)**.

## Contributing

Contributions welcome! See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the branching model, PR guidelines, and how to claim an issue before you start coding. Please follow our **[Code of Conduct](docs/CODE_OF_CONDUCT.md)**.

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
- `pnpm db:user:studio` - open Drizzle Studio for the user DB

## Project Structure

See **[docs/architecture.md](docs/architecture.md)** for the folder layout and where new code should go.

## Product Positioning

PsxWorth is focused on a very specific use case: helping PSX investors understand their actual portfolio performance, allocation, entitlements, and exposure without relying on spreadsheets or generic global investing apps. The standout differentiator is AI-assisted transaction import combined with PSX-specific analytics like corporate action tracking and ETF holdings visibility.

## Deployment

The app is configured for standalone Next.js output:

```bash
pnpm build
pnpm start
```

If you deploy to Vercel or another platform, make sure all environment variables above are configured for the target environment.
