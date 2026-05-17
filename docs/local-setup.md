# Local Setup

A quick guide to get psxworth running on your machine.

## Prerequisites

- Node.js 20+ (CI uses 24)
- pnpm 8+ — install with `corepack enable && corepack prepare pnpm@8.15.0 --activate`
- Two PostgreSQL databases (one for user data, one for market data)
- Accounts/keys for: Clerk, PostHog, Vercel AI Gateway

## Steps

### 1. Clone and install

```bash
git clone https://github.com/Wajahat43/psxworth.git
cd psxworth
pnpm install
```

### 2. Create the two PostgreSQL databases

The app needs two databases: one for user data (writable) and one for market data (read-only).

If you have PostgreSQL running locally (e.g. via Postgres.app, `brew install postgresql`, or Docker), create them with:

```bash
createdb psxworth_user
createdb psxworth_data
```

Or in `psql`:

```sql
CREATE DATABASE psxworth_user;
CREATE DATABASE psxworth_data;
```

Note the connection strings — you'll need them in the next step. They typically look like:

```
postgres://<user>:<password>@localhost:5432/psxworth_user
postgres://<user>:<password>@localhost:5432/psxworth_data
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

- `USER_DATABASE_URL` → connection string for `psxworth_user`
- `DATA_DATABASE_URL` → connection string for `psxworth_data`
- The remaining 7 variables come from Clerk, PostHog, and Vercel AI Gateway accounts

All 9 variables in `.env.example` are required to run locally.

> The `DATA_DATABASE_URL` only needs read access in production. Locally you can use the same user as `USER_DATABASE_URL` for convenience.

### 4. Run user-database migrations

```bash
pnpm db:user:migrate
```

This applies the Drizzle migrations in `migrations-userdb/` to the database pointed at by `USER_DATABASE_URL`.

### 5. Seed the data database

The app reads PSX market data (prices, payouts, ETF holdings) from a separate database. We publish a daily snapshot to a public R2 bucket so you don't need access to the live data DB.

```bash
# 1. Download the latest snapshot
curl -L -o psxworth-data.dmp \
  "https://pub-63afb24e90e0481a85914526878c4913.r2.dev/latest.dmp"

# 2. Restore into your local data DB (the database must exist and be empty)
pg_restore --no-owner --no-privileges \
  --dbname="$DATA_DATABASE_URL" \
  psxworth-data.dmp
```

The `latest.dmp` file is refreshed daily by [.github/workflows/sync-data-snapshot.yml](../.github/workflows/sync-data-snapshot.yml).

### 6. Start the dev server

```bash
pnpm dev
```

The app runs at `https://localhost:3000` (Next.js Turbopack with experimental HTTPS). Accept the local cert warning the first time.

## Useful scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start dev server with HTTPS |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:types` | TypeScript type check |
| `pnpm format` | Format with Prettier |
| `pnpm db:user:generate` | Generate a new Drizzle migration after schema changes |
| `pnpm db:user:migrate` | Apply pending migrations |
| `pnpm db:user:studio` | Open Drizzle Studio UI for the user DB |

## Troubleshooting

**`Missing publishableKey` from Clerk on first run.** Your `.env.local` is missing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. The build/dev server reads it at startup — restart after editing.

**HTTPS cert errors in the browser.** Next.js generates a self-signed cert for `--experimental-https`. Accept the warning, or run without HTTPS by editing the `dev` script.

**`pnpm install` fails on `--frozen-lockfile`.** You're on a different pnpm version than `package.json` declares. Run `corepack prepare pnpm@8.15.0 --activate` to match CI.
