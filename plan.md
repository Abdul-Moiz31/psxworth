# Turso -> Postgres Migration Plan (User Database)

## 1. Goal and Scope

### Goal
Move the **user transactional database** from Turso/libSQL to a new dedicated Postgres database while keeping the existing `dataDb` Postgres database separate.

### In Scope
- Replace Turso/libSQL runtime connection used by `db` with Postgres.
- Migrate user data for these tables:
  - `portfolioTable`
  - `transactionTable`
  - `stockPerformance`
- Update Drizzle schema/config/migrations for Postgres user DB.
- Add data backfill + validation + cutover + rollback runbooks.
- Keep app behavior/API unchanged.

### Out of Scope
- Merging user DB with existing `dataDb`.
- Refactoring product features unrelated to persistence.
- Re-modeling business logic unless needed for compatibility.

---

## 1.1 Finalized Decisions

- `transactionDate` will be stored as Postgres `date` (date-only semantics).
- `transactionDate` will be represented in app/domain code as `YYYY-MM-DD` string (`LocalDate`), not JS `Date`.
- Drizzle mapping for `transactionDate` will use Postgres `date` with string mode.
- UI components may use `Date` internally for calendar widgets, but server/actions/DB boundaries use `LocalDate` only.
- `createdAt` and `updatedAt` will be stored as Postgres `timestamptz`.
- `createdAt` and `updatedAt` are DB-managed (not user-managed).
- Turso writes will be manually disabled before final migration/cutover.

---

## 2. Current State (Repo Snapshot)

### Current DB split
- `src/db/index.ts`
  - `db`: Postgres (`drizzle-orm/postgres-js`) using `USER_DATABASE_URL` for user data.
  - `dataDb`: Postgres (`drizzle-orm/postgres-js`) for market/data tables.
- `src/db/schema.ts`
  - Re-exports user schema from `src/db/userdb-schema.ts`.
- `src/db/userdb-schema.ts`
  - User tables are now defined with `pgTable`.
  - `transactionDate` uses Postgres `date` string mode.
- `src/db/datadb-schema.ts`
  - Existing market/data tables already in Postgres.
- `drizzle.user.config.ts`
  - Added for user DB Postgres migrations.
- `scripts/runSchemaMigration.ts` + `src/db/migration.ts`
  - Turso-specific historical migration script.

### User DB call sites
User DB is used broadly in:
- `src/actions/portfolio/*`
- `src/actions/transaction/*`
- `src/actions/portfolioPerformance/*`
- `src/features/historicalReturns/actions/*`
- `src/actions/utils/middleware.ts`
- `src/actions/status/stats.ts`

This means migration must preserve schema contracts and query behavior.

---

## 3. Target Architecture

### Two separate Postgres databases
- **User DB (new):** `USER_DATABASE_URL` (new env var)
  - Own schema/tables for portfolio + transactions + stock performance.
- **Data DB (existing):** `DATA_DATABASE_URL` (unchanged)
  - Keep existing market/payouts/ETF/historical tables.

### App connection strategy
- `db` -> Postgres user DB via `drizzle-orm/postgres-js`
- `dataDb` -> existing Postgres data DB (no functional changes)

### Why this target
- Keeps domain separation and blast radius low.
- Matches current logical split in code.
- Simplifies auth/connection/backup boundaries.

---

## 4. Migration Strategy

Recommended strategy: **Expand -> Backfill -> Validate -> Cutover -> Contract**

1. Build new Postgres user schema in parallel.
2. Backfill all data from Turso to Postgres user DB.
3. Validate row counts, checksums, and spot queries.
4. Cut over app reads/writes to Postgres user DB.
5. Keep Turso as rollback source for a defined window.
6. Decommission Turso path after soak period.

This avoids risky in-place conversion and gives a clean rollback option.

---

## 5. Detailed Execution Plan

## Phase 0: Pre-migration design and decisions

### Tasks
- Freeze field-level mapping for each user table.
- Timestamp storage contract:
  - `transactionDate`: Postgres `date` + app-level `LocalDate` string (`YYYY-MM-DD`).
  - `createdAt`, `updatedAt`: Postgres `timestamptz`.
- Define LocalDate contract:
  - Add a shared `LocalDate` type (`YYYY-MM-DD`).
  - Validate transaction payloads against strict LocalDate format.
  - Keep conversion between calendar widget `Date` and LocalDate confined to UI/form layer.
- Decide ID strategy:
  - Preserve existing IDs during backfill (recommended).
  - Set sequences after insert to max(id).
- Define manual write-freeze procedure for Turso before final sync.

### Deliverables
- Signed-off mapping doc.
- Final migration checklist.

---

## Phase 1: Codebase preparation

### Tasks
- Add a dedicated schema file for user Postgres tables (e.g. `src/db/userdb-schema.ts`).
- Keep names/columns aligned with existing app expectations.
- Add a shared `LocalDate` type and helper utilities.
- Update transaction/action/domain types so `transactionDate` is `LocalDate` at server boundaries.
- Update `src/db/index.ts`:
  - `db` points to Postgres user DB.
  - `dataDb` remains unchanged.
- Introduce env var `USER_DATABASE_URL`.
- Keep `DATA_DATABASE_URL` unchanged.
- Add compatibility helper types if any type regressions occur.

### Acceptance Criteria
- App compiles with `db` typed against Postgres schema.
- No functional code paths still depend on Turso client.

---

## Phase 2: Drizzle migration setup for user Postgres DB

### Tasks
- Add/adjust Drizzle config for user DB Postgres migrations.
  - Option 1: Replace `drizzle.config.ts` to user PG.
  - Option 2: Keep separate configs (`drizzle.user.config.ts`, etc.) for clarity.
- Generate initial Postgres migration SQL for user tables.
- Add migration runner script for user DB (new script in `scripts/`).
- Keep existing Turso migration script for historical reference only.

### Acceptance Criteria
- Can create user tables in a clean Postgres instance from migrations only.

---

## Phase 3: Backfill tooling (Turso -> Postgres user DB)

### Tasks
- Create a dedicated backfill script (e.g. `scripts/migrateUserDbToPostgres.ts`) that:
  - Reads from Turso.
  - Writes to user Postgres in dependency order:
    1. `portfolioTable`
    2. `transactionTable`
    3. `stockPerformance`
  - Preserves primary keys.
  - Batches inserts for performance.
  - Is idempotent (`upsert` or truncate-and-load mode with explicit flag).
- Add robust logging and failure summary.
- Add dry-run mode.

### Data integrity checks in script
- Source vs target row counts per table.
- Per-user row count comparisons.
- Aggregate checks:
  - transaction sums (shares/cost/dividends)
  - stockPerformance totals.

### Acceptance Criteria
- Backfill completes in staging with zero mismatches.

---

## Phase 4: Validation and parity testing

### Tasks
- Add validation query set for critical workflows:
  - list portfolios
  - add/edit/delete transaction
  - recompute performance
  - historical returns calculation inputs.
- Run these checks against both DBs and compare outputs.
- Run `pnpm lint` and `pnpm lint:types`.
- Add targeted tests for persistence-critical actions if missing.
- Add timezone regression tests for date rendering/parsing (ensures no off-by-one day shifts).

### Acceptance Criteria
- Functional parity for all user-facing paths.
- No schema/type regressions.

---

## Phase 5: Cutover plan

### Preferred cutover (manual Turso write freeze)
- Manually disable writes on Turso.
- Run final backfill/sync.
- Run validation suite.
- Switch runtime env from Turso creds to `USER_DATABASE_URL`.
- Restart deployment.
- Run post-cutover smoke checks.

### Smoke checks
- Create portfolio.
- Insert buy/sell/dividend transaction.
- Edit/delete transaction.
- Confirm portfolio performance and historical returns still compute.

### Acceptance Criteria
- Production traffic fully served from Postgres user DB with no P1/P2 errors.

---

## Phase 6: Rollback plan

### Rollback steps
1. Keep Turso writes disabled while assessing issue scope.
2. Switch app env back to Turso connection.
3. Restart deployment.
4. Verify core flows on Turso.
5. Investigate and patch migration bug.

### Rollback window
- Keep Turso data and credentials available for at least 1-2 release cycles after cutover.

---

## Phase 7: Post-cutover hardening

### Tasks
- Add indexes based on real query plans in Postgres.
- Enable backups + PITR for user Postgres DB.
- Add DB monitoring:
  - connection saturation
  - query latency
  - error rates.
- Remove Turso-specific runtime dependencies and env vars after stable period.

### Cleanup candidates
- Remove `@libsql/client` if no longer used.
- Deprecate `scripts/runSchemaMigration.ts` and `src/db/migration.ts` when safe.
- Remove Turso env vars from deployment templates.

---

## 6. Schema Mapping Notes (Draft)

## Table: `portfolioTable`
- `id` (INTEGER AUTOINCREMENT) -> `integer generated by default as identity` (preserve values on import).
- `created_at`, `updated_at`:
  - Postgres `timestamptz`.
  - DB-managed defaults (`default now()`), not user-managed values.

## Table: `transactionTable`
- Keep enum-compatible `type` values: `buy | sell | dividend`.
- `transaction_date` -> Postgres `date` (Drizzle string mode).
- Domain/server type for `transactionDate`: `LocalDate` (`YYYY-MM-DD`).
- Avoid JS `Date` at server/DB boundaries to eliminate timezone drift.
- Preserve FK `portfolio_id -> portfolioTable.id` with `ON DELETE CASCADE`.

## Table: `stockPerformance`
- Preserve unique constraint `(portfolio_id, stock_symbol)`.
- Keep FK `portfolio_id -> portfolioTable.id` with `ON DELETE CASCADE`.

---

## 7. Risks and Mitigations

1. Transaction date semantic drift/timezone shifts.
- Mitigation: canonical `LocalDate` (`YYYY-MM-DD`) type end-to-end at server/DB boundaries.

2. Sequence misalignment after ID-preserving insert.
- Mitigation: reset identity sequences to `MAX(id)` after backfill.

3. Silent precision differences for `real` fields.
- Mitigation: compare aggregates with tolerance thresholds.

4. Query performance regressions.
- Mitigation: index review and `EXPLAIN ANALYZE` on hot paths.

---

## 8. Operational Checklist

## Before cutover
- [ ] User Postgres migrations applied.
- [ ] Full backfill completed.
- [ ] Validation report clean.
- [ ] Rollback tested in staging.
- [ ] On-call and runbook prepared.
- [ ] Turso writes manually disabled.

## During cutover
- [ ] Final sync/backfill run.
- [ ] Validation rerun.
- [ ] Env switch + deploy restart.
- [ ] Smoke tests pass.

## After cutover
- [ ] Error and latency dashboards stable.
- [ ] Data parity spot checks pass.
- [ ] Keep Turso fallback active for rollback window.

---

## 9. Implementation Backlog (Concrete File Changes)

1. `src/db/index.ts`
- Replace Turso `db` client with Postgres client bound to `USER_DATABASE_URL`.

2. `src/db/schema.ts` (or new `src/db/userdb-schema.ts`)
- Port from `sqlite-core` to `pg-core` definitions.

3. `drizzle.config.ts` (or new split config files)
- Add user Postgres migration config.

4. `scripts/`
- Add user Postgres migration runner.
- Add Turso -> Postgres backfill script.
- Add validation script.

5. `package.json`
- Add scripts for migrate/backfill/validate user DB.

6. Deployment/env templates
- Add `USER_DATABASE_URL`.
- Keep `DATA_DATABASE_URL` unchanged.

7. Documentation
- Add migration runbook and rollback steps.

---

## 10. Suggested Timeline

1. Week 1
- Phase 0-2 (design + schema + migration infra).

2. Week 2
- Phase 3-4 (backfill tooling + parity validation).

3. Week 3
- Phase 5-7 (production cutover + monitoring + cleanup start).

Timeline can be compressed if dataset size is small and we use a maintenance window.

---

## 11. Definition of Done

- User DB traffic fully on Postgres (`USER_DATABASE_URL`).
- `dataDb` remains separate and unchanged.
- Backfill validated with no unresolved mismatches.
- Rollback tested and documented.
- Turso-specific runtime code removed after stability window.

---

## 12. Master TODOs (Execution Checklist)

## Phase 0: Decisions and Contracts
- [ ] P0.1 Finalize schema mapping for `portfolioTable`, `transactionTable`, `stockPerformance`.
- [ ] P0.2 Finalize `LocalDate` contract (`YYYY-MM-DD`) and document allowed/blocked formats.
- [ ] P0.3 Finalize timestamp strategy (`transactionDate: date`, `createdAt/updatedAt: timestamptz`).
- [ ] P0.4 Finalize ID-preservation strategy and sequence reset approach.
- [ ] P0.5 Document Turso write-freeze procedure and owner for cutover day.

## Phase 1: Codebase and Types
- [x] P1.1 Add user Postgres schema file (`src/db/userdb-schema.ts` or equivalent).
- [x] P1.2 Add shared `LocalDate` type and helper utilities.
- [x] P1.3 Update transaction types so server/domain boundaries use `LocalDate`.
- [ ] P1.4 Update form/action validation to enforce strict `YYYY-MM-DD` for transaction date.
- [x] P1.5 Update DB client wiring in `src/db/index.ts` to use `USER_DATABASE_URL` for `db`.
- [x] P1.6 Keep `dataDb` on `DATA_DATABASE_URL` unchanged.
- [ ] P1.7 Add/verify env documentation for `USER_DATABASE_URL`.
- [x] P1.8 Ensure no Turso runtime usage remains in user DB action paths.

## Phase 2: Migration Infrastructure
- [x] P2.1 Create/adjust Drizzle config for user Postgres migrations.
- [ ] P2.2 Generate initial user DB migration SQL.
- [ ] P2.3 Add user DB migration runner script in `scripts/`.
- [x] P2.4 Add package scripts for migrate/backfill/validate flows.
- [ ] P2.5 Verify a clean user Postgres instance can be bootstrapped from migrations.

## Phase 3: Backfill Tooling
- [ ] P3.1 Implement Turso -> Postgres backfill script with dependency order.
- [ ] P3.2 Preserve IDs during insert and reset sequences to `MAX(id)`.
- [ ] P3.3 Add `dry-run` mode.
- [ ] P3.4 Add idempotent mode (`upsert` or explicit truncate-and-load flag).
- [ ] P3.5 Add logging (row counts, duration, failures, retries).
- [ ] P3.6 Add integrity checks (table counts, per-user counts, aggregates).
- [ ] P3.7 Produce a machine-readable validation report artifact (json/txt).

## Phase 4: Validation and Parity
- [ ] P4.1 Build parity checks for portfolio CRUD and transaction CRUD.
- [ ] P4.2 Build parity checks for performance recomputation and historical returns inputs.
- [ ] P4.3 Add timezone regression tests to prevent off-by-one day display bugs.
- [ ] P4.4 Run `pnpm lint`.
- [x] P4.5 Run `pnpm lint:types`.
- [ ] P4.6 Sign off staging parity report (no unresolved mismatches).

## Phase 5: Cutover
- [ ] P5.1 Manually disable Turso writes.
- [ ] P5.2 Run final sync/backfill.
- [ ] P5.3 Run validation suite against final synced data.
- [ ] P5.4 Switch runtime env to `USER_DATABASE_URL`.
- [ ] P5.5 Restart deployment.
- [ ] P5.6 Execute smoke tests (portfolio create, transaction create/edit/delete, performance/historical returns).
- [ ] P5.7 Record cutover completion timestamp and deployment version.

## Phase 6: Rollback Readiness
- [ ] P6.1 Verify rollback procedure in staging.
- [ ] P6.2 Confirm Turso credentials/data retained for rollback window.
- [ ] P6.3 Prepare one-command rollback env switch/runbook steps.
- [ ] P6.4 Define rollback trigger thresholds and on-call decision owner.

## Phase 7: Post-cutover Hardening and Cleanup
- [ ] P7.1 Review query plans and add missing indexes.
- [ ] P7.2 Enable backups and PITR for user Postgres DB.
- [ ] P7.3 Configure monitoring (errors, latency, pool saturation).
- [ ] P7.4 Run data parity spot checks during soak window.
- [ ] P7.5 Remove Turso runtime dependencies once stable.
- [ ] P7.6 Remove/deprecate Turso-only scripts (`scripts/runSchemaMigration.ts`, `src/db/migration.ts`) when safe.
- [ ] P7.7 Remove Turso env vars from deployment templates after rollback window.

## Ready-to-Start Next Actions
- [x] N1 Create `LocalDate` type/util and wire it into transaction schema/types.
- [x] N2 Add user Postgres schema and update `src/db/index.ts` to read `USER_DATABASE_URL`.
- [x] N3 Add user Postgres Drizzle config and package scripts.
- [ ] N4 Generate first user Postgres migration.

## 13. Progress Snapshot (Updated)

### Completed so far
- User DB switched to Postgres runtime in `src/db/index.ts`.
- User Postgres schema added in `src/db/userdb-schema.ts`.
- `src/db/schema.ts` now points to Postgres user schema.
- `LocalDate` type/helpers added and wired through transaction form/actions.
- Postgres Drizzle config added (`drizzle.user.config.ts`).
- Package scripts added: `db:user:generate`, `db:user:migrate`.
- TypeScript compile pass currently succeeds (`pnpm lint:types`).

### Still pending (high priority)
- Generate first user DB migration (`P2.2` / `N4`).
- Add user DB migration runner script in `scripts/` (`P2.3`).
- Implement Turso -> Postgres backfill script (`P3.1+`).
- Implement validation/parity script (`P4.1+`).
- Update env/deployment docs with `USER_DATABASE_URL` (`P1.7`).

### About “missing script” callout
- Correct: backfill and validation scripts are **not created yet**.
- Also pending: user migration runner script under `scripts/`.
