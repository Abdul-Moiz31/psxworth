# Architecture

> **A note on the state of this codebase:** psxworth has evolved over time as I have. I've tried different patterns along the way — atomic design (atoms/molecules/organisms), page-colocated components, and now feature folders — and this doc reflects the latest approach I've settled on. You'll see remnants of older patterns scattered around; that's the history, not the direction. Everything new should follow what's described here, and we'll migrate the old code over time.

The codebase follows a **feature-folder** structure. Each domain (portfolio, payouts, ETFs, etc.) lives in its own folder under `src/features/` and owns its components, server actions, hooks, types, and schema.

## Folder layout

```
src/
  app/                  # Next.js routes only — page.tsx, layout.tsx, route.ts
                        # Page-specific widgets go in _components/ inside the route folder
  components/
    ui/                 # Pure UI primitives — single concept, presentational
                        # (Button, Input, Popover, Dialog — shadcn-style)
    patterns/           # Composed, app-wide reusable building blocks with no domain knowledge
                        # (SearchableDropdown, DataTable, EmptyState, ConfirmDialog, etc.)
  features/
    <feature>/
      components/       # Feature-specific UI
      actions/          # Server actions
      hooks/            # Feature-specific hooks
      types.ts
      schema.ts         # Zod schemas, if applicable
  db/                   # Drizzle schema + clients
  lib/                  # Cross-cutting utilities (AI helpers, rate limiting, etc.)
  utils/                # Generic hooks, formatters, constants
```

## Where does new code go?

Use this decision tree:

1. **Is it a Next.js route or layout?** → `src/app/...`
2. **Is it used only by one route?** → `src/app/<route>/_components/`
3. **Is it a single-concept UI primitive** (Button, Input, Popover)? → `src/components/ui/`
4. **Is it a composed, reusable UI pattern with no domain knowledge** (SearchableDropdown, DataTable, EmptyState, ConfirmDialog)? → `src/components/patterns/`
5. **Is it tied to a domain** (portfolio, payouts, ETF, transactions, etc.)? → `src/features/<domain>/`
6. **Is it a truly generic utility** (date formatting, hooks like `useMediaQuery`)? → `src/utils/`
7. **Is it cross-cutting infrastructure** (AI client, rate limiter, logging)? → `src/lib/`

> **`ui/` vs. `patterns/` test:** Would you ship the component as-is in a completely different product? If yes, it goes in `ui/` (atomic) or `patterns/` (composed). If you'd have to rip out portfolio-specific logic first, it belongs in `features/`.

If none of the above fit cleanly, prefer `features/<domain>/` over inventing a new top-level folder.

## Naming conventions

- Folders and files: `camelCase` for code, `kebab-case` for routes (matches Next.js conventions)
- Components: `PascalCase` for the component, file named after the component (`PortfolioCard.tsx` exports `PortfolioCard`)
- Server actions: verb-noun (`createPortfolio.ts`, `recalculatePerformance.ts`)
- Hooks: `useSomething.ts`

## Legacy code

You'll see existing code in `src/components/molecules/` and `src/components/organisms/` — these follow an older atomic-design pattern we're moving away from. **Don't add new files there.** When you touch one of these files for a fix or feature, move it into the appropriate `features/<domain>/components/` folder as part of your PR.

## Database access

- Use Drizzle for all queries; raw SQL only inside `dataDb.execute(sql\`...\`)` for read-only complex queries (e.g. window functions)
- `db` (user DB) is read-write; `dataDb` (market data DB) is read-only — don't write to it from app code

## Server actions vs. API routes

- Default to **server actions** in `features/<feature>/actions/` for mutations and most reads
- Use `src/app/api/.../route.ts` only when you need a real HTTP endpoint (webhooks, public APIs, things called from non-React clients)
