import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { sql as drizzleSql } from "drizzle-orm";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { portfolioTable, stockPerformanceTable, transactionTable } from "../src/db/userdb-schema";
import { toLocalDate as toAppLocalDate, type LocalDate } from "../src/types/localDate";

config({ path: ".env.local", override: true });
config({ path: ".env" });

type TursoRow = Record<string, unknown>;

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function parseBatchSize(): number {
  const raw = getArg("batch");
  if (!raw) return 500;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid --batch value "${raw}". Expected a positive integer.`);
  }
  return Math.floor(parsed);
}

function toNumber(value: unknown, fieldName: string): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  throw new Error(`Invalid numeric value for ${fieldName}: ${String(value)}`);
}

function toOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  return toNumber(value, "optional numeric field");
}

function toBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  throw new Error(`Invalid boolean value for ${fieldName}: ${String(value)}`);
}

function toDate(value: unknown, fieldName: string): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === "number" && Number.isFinite(value)) {
    // Source data can contain mixed units (sec, ms, microseconds, nanoseconds).
    // Try multiple interpretations and pick the first sane one.
    const now = Date.now();
    const min = new Date("2000-01-01T00:00:00.000Z").getTime();
    const max = new Date("2100-01-01T00:00:00.000Z").getTime();

    const candidates = [
      value, // assume ms
      value * 1000, // assume sec
      value / 1000, // assume microseconds
      value / 1_000_000, // assume nanoseconds
    ];

    const sane = candidates
      .map((ms) => Math.trunc(ms))
      .filter((ms) => Number.isFinite(ms) && ms >= min && ms <= max)
      .sort((a, b) => Math.abs(a - now) - Math.abs(b - now));

    if (sane.length > 0) {
      return new Date(sane[0]);
    }
  }

  if (typeof value === "string" && value.trim() !== "") {
    const trimmed = value.trim();
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return toDate(numeric, fieldName);

    // If string is ISO/date-like, parse directly.
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  throw new Error(`Invalid date value for ${fieldName}: ${String(value)}`);
}

function toLocalDate(value: unknown, fieldName: string): LocalDate {
  const date = toDate(value, fieldName);
  return toAppLocalDate(date);
}

async function runBatched<T>(rows: T[], batchSize: number, fn: (batch: T[]) => Promise<void>): Promise<void> {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await fn(batch);
  }
}

async function main() {
  const dryRun = hasFlag("--dry-run");
  const truncate = hasFlag("--truncate");
  const batchSize = parseBatchSize();

  const tursoUrl = process.env.TURSO_CONNECTION_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
  const userDatabaseUrl = process.env.USER_DATABASE_URL;

  if (!tursoUrl) throw new Error("Missing TURSO_CONNECTION_URL in .env/.env.local");
  if (!tursoAuthToken) throw new Error("Missing TURSO_AUTH_TOKEN in .env/.env.local");
  if (!userDatabaseUrl) throw new Error("Missing USER_DATABASE_URL in .env/.env.local");

  console.log(
    `[migrate-userdb] starting (dryRun=${dryRun}, truncate=${truncate}, batchSize=${batchSize})`
  );

  const sourceClient = createClient({ url: tursoUrl, authToken: tursoAuthToken });
  const sourceDb = drizzleLibsql(sourceClient);

  const targetClient = postgres(userDatabaseUrl, { max: 10, idle_timeout: 20 });
  const targetDb = drizzlePostgres(targetClient);

  try {
    const sourcePortfolios = (
      await sourceDb.run(
        drizzleSql`SELECT id, title, user_id, background_color, emoji, created_at, updated_at
                   FROM portfolioTable
                   ORDER BY id`
      )
    ).rows as TursoRow[];

    const sourceTransactions = (
      await sourceDb.run(
        drizzleSql`SELECT id, user_id, portfolio_id, type, transaction_date, stock_symbol,
                          number_of_shares, price_per_share, dividend_per_share, commission_and_taxes,
                          is_commission_percentage, note, created_at, updated_at
                   FROM transactionTable
                   ORDER BY id`
      )
    ).rows as TursoRow[];

    const sourceStockPerformance = (
      await sourceDb.run(
        drizzleSql`SELECT id, user_id, portfolio_id, stock_symbol, average_cost, total_shares, total_cost,
                          total_dividends, realized_profit, tax_and_broker_fee, total_inflow, total_outflow,
                          created_at, updated_at
                   FROM stockPerformance
                   ORDER BY id`
      )
    ).rows as TursoRow[];

    console.log(
      `[migrate-userdb] source counts: portfolios=${sourcePortfolios.length}, transactions=${sourceTransactions.length}, stockPerformance=${sourceStockPerformance.length}`
    );

    if (dryRun) {
      console.log("[migrate-userdb] dry-run mode enabled. No writes executed.");
      return;
    }

    await targetDb.transaction(async (tx) => {
      let changedPortfolios = 0;
      let changedTransactions = 0;
      let changedStockPerformance = 0;

      if (truncate) {
        console.log("[migrate-userdb] truncating target tables...");
        await tx.delete(transactionTable);
        await tx.delete(stockPerformanceTable);
        await tx.delete(portfolioTable);
      }

      console.log("[migrate-userdb] upserting portfolios...");
      const portfolioRows = sourcePortfolios.map((row) => ({
        id: toNumber(row.id, "portfolio.id"),
        title: String(row.title ?? ""),
        userId: String(row.user_id ?? ""),
        backgroundColor: String(row.background_color ?? ""),
        emoji: String(row.emoji ?? ""),
        createdAt: toDate(row.created_at, "portfolio.created_at"),
        updatedAt: toDate(row.updated_at, "portfolio.updated_at"),
      }));

      await runBatched(portfolioRows, batchSize, async (batch) => {
        const changed = await tx
          .insert(portfolioTable)
          .values(batch)
          .onConflictDoUpdate({
            target: portfolioTable.id,
            set: {
              title: drizzleSql`excluded.title`,
              userId: drizzleSql`excluded.user_id`,
              backgroundColor: drizzleSql`excluded.background_color`,
              emoji: drizzleSql`excluded.emoji`,
              createdAt: drizzleSql`excluded.created_at`,
              updatedAt: drizzleSql`excluded.updated_at`,
            },
            setWhere: drizzleSql`
              ${portfolioTable.title} IS DISTINCT FROM excluded.title OR
              ${portfolioTable.userId} IS DISTINCT FROM excluded.user_id OR
              ${portfolioTable.backgroundColor} IS DISTINCT FROM excluded.background_color OR
              ${portfolioTable.emoji} IS DISTINCT FROM excluded.emoji OR
              ${portfolioTable.createdAt} IS DISTINCT FROM excluded.created_at OR
              ${portfolioTable.updatedAt} IS DISTINCT FROM excluded.updated_at
            `,
          })
          .returning({ id: portfolioTable.id });

        changedPortfolios += changed.length;
      });

      console.log("[migrate-userdb] upserting transactions...");
      const transactionRows = sourceTransactions.map((row) => ({
        id: toNumber(row.id, "transaction.id"),
        userId: String(row.user_id ?? ""),
        portfolioId: toNumber(row.portfolio_id, "transaction.portfolio_id"),
        type: String(row.type ?? "") as "buy" | "sell" | "dividend",
        transactionDate: toLocalDate(row.transaction_date, "transaction.transaction_date"),
        stockSymbol: String(row.stock_symbol ?? ""),
        numberOfShares: toNumber(row.number_of_shares, "transaction.number_of_shares"),
        pricePerShare: toOptionalNumber(row.price_per_share),
        dividendPerShare: toOptionalNumber(row.dividend_per_share),
        commissionAndTaxes: toOptionalNumber(row.commission_and_taxes),
        isCommissionPercentage: toBoolean(row.is_commission_percentage, "transaction.is_commission_percentage"),
        note: row.note == null ? null : String(row.note),
        createdAt: toDate(row.created_at, "transaction.created_at"),
        updatedAt: toDate(row.updated_at, "transaction.updated_at"),
      }));

      await runBatched(transactionRows, batchSize, async (batch) => {
        const changed = await tx
          .insert(transactionTable)
          .values(batch)
          .onConflictDoUpdate({
            target: transactionTable.id,
            set: {
              userId: drizzleSql`excluded.user_id`,
              portfolioId: drizzleSql`excluded.portfolio_id`,
              type: drizzleSql`excluded.type`,
              transactionDate: drizzleSql`excluded.transaction_date`,
              stockSymbol: drizzleSql`excluded.stock_symbol`,
              numberOfShares: drizzleSql`excluded.number_of_shares`,
              pricePerShare: drizzleSql`excluded.price_per_share`,
              dividendPerShare: drizzleSql`excluded.dividend_per_share`,
              commissionAndTaxes: drizzleSql`excluded.commission_and_taxes`,
              isCommissionPercentage: drizzleSql`excluded.is_commission_percentage`,
              note: drizzleSql`excluded.note`,
              createdAt: drizzleSql`excluded.created_at`,
              updatedAt: drizzleSql`excluded.updated_at`,
            },
            setWhere: drizzleSql`
              ${transactionTable.userId} IS DISTINCT FROM excluded.user_id OR
              ${transactionTable.portfolioId} IS DISTINCT FROM excluded.portfolio_id OR
              ${transactionTable.type} IS DISTINCT FROM excluded.type OR
              ${transactionTable.transactionDate} IS DISTINCT FROM excluded.transaction_date OR
              ${transactionTable.stockSymbol} IS DISTINCT FROM excluded.stock_symbol OR
              ${transactionTable.numberOfShares} IS DISTINCT FROM excluded.number_of_shares OR
              ${transactionTable.pricePerShare} IS DISTINCT FROM excluded.price_per_share OR
              ${transactionTable.dividendPerShare} IS DISTINCT FROM excluded.dividend_per_share OR
              ${transactionTable.commissionAndTaxes} IS DISTINCT FROM excluded.commission_and_taxes OR
              ${transactionTable.isCommissionPercentage} IS DISTINCT FROM excluded.is_commission_percentage OR
              ${transactionTable.note} IS DISTINCT FROM excluded.note OR
              ${transactionTable.createdAt} IS DISTINCT FROM excluded.created_at OR
              ${transactionTable.updatedAt} IS DISTINCT FROM excluded.updated_at
            `,
          })
          .returning({ id: transactionTable.id });

        changedTransactions += changed.length;
      });

      console.log("[migrate-userdb] upserting stock performance...");
      const stockPerformanceRows = sourceStockPerformance.map((row) => ({
        userId: String(row.user_id ?? ""),
        portfolioId: toNumber(row.portfolio_id, "stockPerformance.portfolio_id"),
        stockSymbol: String(row.stock_symbol ?? ""),
        averageCost: toNumber(row.average_cost, "stockPerformance.average_cost"),
        totalShares: toNumber(row.total_shares, "stockPerformance.total_shares"),
        totalCost: toNumber(row.total_cost, "stockPerformance.total_cost"),
        totalDividends: toNumber(row.total_dividends, "stockPerformance.total_dividends"),
        realizedProfit: toNumber(row.realized_profit, "stockPerformance.realized_profit"),
        commissionAndTaxes: toNumber(row.tax_and_broker_fee, "stockPerformance.tax_and_broker_fee"),
        totalInflow: toNumber(row.total_inflow, "stockPerformance.total_inflow"),
        totalOutflow: toNumber(row.total_outflow, "stockPerformance.total_outflow"),
        createdAt: toDate(row.created_at, "stockPerformance.created_at"),
        updatedAt: toDate(row.updated_at, "stockPerformance.updated_at"),
      }));

      await runBatched(stockPerformanceRows, batchSize, async (batch) => {
        const changed = await tx
          .insert(stockPerformanceTable)
          .values(batch)
          .onConflictDoUpdate({
            target: [stockPerformanceTable.portfolioId, stockPerformanceTable.stockSymbol],
            set: {
              userId: drizzleSql`excluded.user_id`,
              portfolioId: drizzleSql`excluded.portfolio_id`,
              stockSymbol: drizzleSql`excluded.stock_symbol`,
              averageCost: drizzleSql`excluded.average_cost`,
              totalShares: drizzleSql`excluded.total_shares`,
              totalCost: drizzleSql`excluded.total_cost`,
              totalDividends: drizzleSql`excluded.total_dividends`,
              realizedProfit: drizzleSql`excluded.realized_profit`,
              commissionAndTaxes: drizzleSql`excluded.tax_and_broker_fee`,
              totalInflow: drizzleSql`excluded.total_inflow`,
              totalOutflow: drizzleSql`excluded.total_outflow`,
              createdAt: drizzleSql`excluded.created_at`,
              updatedAt: drizzleSql`excluded.updated_at`,
            },
            setWhere: drizzleSql`
              ${stockPerformanceTable.userId} IS DISTINCT FROM excluded.user_id OR
              ${stockPerformanceTable.portfolioId} IS DISTINCT FROM excluded.portfolio_id OR
              ${stockPerformanceTable.stockSymbol} IS DISTINCT FROM excluded.stock_symbol OR
              ${stockPerformanceTable.averageCost} IS DISTINCT FROM excluded.average_cost OR
              ${stockPerformanceTable.totalShares} IS DISTINCT FROM excluded.total_shares OR
              ${stockPerformanceTable.totalCost} IS DISTINCT FROM excluded.total_cost OR
              ${stockPerformanceTable.totalDividends} IS DISTINCT FROM excluded.total_dividends OR
              ${stockPerformanceTable.realizedProfit} IS DISTINCT FROM excluded.realized_profit OR
              ${stockPerformanceTable.commissionAndTaxes} IS DISTINCT FROM excluded.tax_and_broker_fee OR
              ${stockPerformanceTable.totalInflow} IS DISTINCT FROM excluded.total_inflow OR
              ${stockPerformanceTable.totalOutflow} IS DISTINCT FROM excluded.total_outflow OR
              ${stockPerformanceTable.createdAt} IS DISTINCT FROM excluded.created_at OR
              ${stockPerformanceTable.updatedAt} IS DISTINCT FROM excluded.updated_at
            `,
          })
          .returning({ id: stockPerformanceTable.id });

        changedStockPerformance += changed.length;
      });

      console.log("[migrate-userdb] resetting identity sequences...");
      await tx.execute(
        drizzleSql`SELECT setval(pg_get_serial_sequence('"portfolioTable"', 'id'), COALESCE((SELECT MAX(id) FROM "portfolioTable"), 1), true)`
      );
      await tx.execute(
        drizzleSql`SELECT setval(pg_get_serial_sequence('"transactionTable"', 'id'), COALESCE((SELECT MAX(id) FROM "transactionTable"), 1), true)`
      );
      await tx.execute(
        drizzleSql`SELECT setval(pg_get_serial_sequence('"stockPerformance"', 'id'), COALESCE((SELECT MAX(id) FROM "stockPerformance"), 1), true)`
      );

      console.log(
        `[migrate-userdb] current run changed rows: portfolios=${changedPortfolios}, transactions=${changedTransactions}, stockPerformance=${changedStockPerformance}`
      );
    });

    const [targetPortfolioCountResult] = (await targetDb.execute(
      drizzleSql`SELECT COUNT(*)::int AS count FROM "portfolioTable"`
    )) as Array<{ count: number }>;
    const [targetTransactionCountResult] = (await targetDb.execute(
      drizzleSql`SELECT COUNT(*)::int AS count FROM "transactionTable"`
    )) as Array<{ count: number }>;
    const [targetStockPerformanceCountResult] = (await targetDb.execute(
      drizzleSql`SELECT COUNT(*)::int AS count FROM "stockPerformance"`
    )) as Array<{ count: number }>;

    const targetPortfolioCount = Number(targetPortfolioCountResult?.count ?? 0);
    const targetTransactionCount = Number(targetTransactionCountResult?.count ?? 0);
    const targetStockPerformanceCount = Number(targetStockPerformanceCountResult?.count ?? 0);

    console.log(
      `[migrate-userdb] target counts: portfolios=${targetPortfolioCount}, transactions=${targetTransactionCount}, stockPerformance=${targetStockPerformanceCount}`
    );

    if (
      targetPortfolioCount < sourcePortfolios.length ||
      targetTransactionCount < sourceTransactions.length ||
      targetStockPerformanceCount < sourceStockPerformance.length
    ) {
      throw new Error(
        "Post-migration counts are lower than source counts. Investigate before cutover."
      );
    }

    console.log("[migrate-userdb] migration completed successfully.");
  } finally {
    await targetClient.end({ timeout: 5 });
    sourceClient.close();
  }
}

main().catch((error) => {
  console.error("[migrate-userdb] failed:", error);
  process.exit(1);
});
