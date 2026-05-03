// Improved Turso-compatible migration script
import { sql } from "drizzle-orm";

export async function migrateToIntegersAndTimestampsForTurso(db: any) {
  await db.transaction(async (tx: any) => {
    // Disable foreign key constraints during migration
    await tx.run(sql`PRAGMA foreign_keys = OFF`);

    console.log("Creating new table structures...");

    // Create new tables with temporary names (without foreign keys initially)
    await tx.run(sql`
      CREATE TABLE portfolioTable_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        user_id TEXT NOT NULL,
        background_color TEXT NOT NULL,
        emoji TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
        updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
      )
    `);

    // Note: StocksPrices lives in a separate DB. We intentionally do not migrate it here.

    await tx.run(sql`
      CREATE TABLE transactionTable_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        portfolio_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend')),
        transaction_date INTEGER NOT NULL,
        stock_symbol TEXT NOT NULL,
        number_of_shares REAL NOT NULL,
        price_per_share REAL,
        dividend_per_share REAL,
        commission_and_taxes REAL,
        is_commission_percentage INTEGER NOT NULL,
        note TEXT,
        created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
        updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
      )
    `);

    await tx.run(sql`
      CREATE TABLE stockPerformance_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        portfolio_id INTEGER NOT NULL,
        stock_symbol TEXT NOT NULL,
        average_cost REAL NOT NULL DEFAULT 0,
        total_shares REAL NOT NULL DEFAULT 0,
        total_cost REAL NOT NULL DEFAULT 0,
        total_dividends REAL NOT NULL DEFAULT 0,
        realized_profit REAL NOT NULL DEFAULT 0,
        tax_and_broker_fee REAL NOT NULL DEFAULT 0,
        total_inflow REAL NOT NULL DEFAULT 0,
        total_outflow REAL NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
        updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
        UNIQUE (portfolio_id, stock_symbol)
      )
    `);

    // Create mapping table for portfolio IDs
    await tx.run(sql`
      CREATE TEMPORARY TABLE portfolio_id_mapping (
        old_id TEXT PRIMARY KEY,
        new_id INTEGER
      )
    `);

    console.log("Migrating portfolios...");

    // Helper function for safe timestamp conversion
    const convertToSeconds = (dateValue: any): number => {
      if (typeof dateValue === "number") {
        // If value looks like milliseconds (>= 2e12), convert to seconds
        return dateValue >= 2000000000000 ? Math.floor(dateValue / 1000) : dateValue;
      }
      if (typeof dateValue === "string") {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${dateValue}`);
        }
        return Math.floor(date.getTime() / 1000);
      }
      throw new Error(`Unexpected date type: ${typeof dateValue}`);
    };

    // Migrate portfolios with error handling
    const portfolios = await tx.all(sql`
      SELECT * FROM portfolioTable ORDER BY created_at, id
    `);

    let migratedCount = 0;
    for (const portfolio of portfolios) {
      try {
        const createdAt = convertToSeconds(portfolio.created_at);
        const updatedAt = convertToSeconds(portfolio.updated_at);

        const result = await tx.run(sql`
          INSERT INTO portfolioTable_new (
            title, user_id, background_color, emoji, created_at, updated_at
          ) VALUES (
            ${portfolio.title},
            ${portfolio.user_id},
            ${portfolio.background_color},
            ${portfolio.emoji},
            ${createdAt},
            ${updatedAt}
          )
        `);

        await tx.run(sql`
          INSERT INTO portfolio_id_mapping (old_id, new_id) 
          VALUES (${portfolio.id}, ${result.lastInsertRowid})
        `);

        migratedCount++;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to migrate portfolio ${portfolio.id}: ${message}`);
      }
    }

    console.log(`Migrated ${migratedCount} portfolios`);

    // Migrate transactions with batch processing for better performance
    console.log("Migrating transactions...");
    await tx.run(sql`
      INSERT INTO transactionTable_new (
        user_id, portfolio_id, type, transaction_date, stock_symbol,
        number_of_shares, price_per_share, dividend_per_share,
        commission_and_taxes, is_commission_percentage, note,
        created_at, updated_at
      )
      SELECT 
        t.user_id,
        pm.new_id,
        t.type,
        CASE 
          WHEN typeof(t.transaction_date) = 'integer' AND t.transaction_date >= 2000000000000 THEN CAST(t.transaction_date / 1000 AS INTEGER)
          WHEN typeof(t.transaction_date) = 'integer' THEN t.transaction_date
          ELSE CAST(strftime('%s', t.transaction_date) AS INTEGER)
        END,
        t.stock_symbol,
        t.number_of_shares,
        t.price_per_share,
        t.dividend_per_share,
        t.commission_and_taxes,
        t.is_commission_percentage,
        t.note,
        CASE 
          WHEN typeof(t.created_at) = 'integer' AND t.created_at >= 2000000000000 THEN CAST(t.created_at / 1000 AS INTEGER)
          WHEN typeof(t.created_at) = 'integer' THEN t.created_at
          ELSE CAST(strftime('%s', t.created_at) AS INTEGER)
        END,
        CASE 
          WHEN typeof(t.updated_at) = 'integer' AND t.updated_at >= 2000000000000 THEN CAST(t.updated_at / 1000 AS INTEGER)
          WHEN typeof(t.updated_at) = 'integer' THEN t.updated_at
          ELSE CAST(strftime('%s', t.updated_at) AS INTEGER)
        END
      FROM transactionTable t
      JOIN portfolio_id_mapping pm ON t.portfolio_id = pm.old_id
    `);

    const transactionCount = await tx.get(sql`SELECT COUNT(*) as count FROM transactionTable_new`);
    console.log(`Migrated ${transactionCount.count} transactions`);

    // Migrate stock performance
    console.log("Migrating stock performance...");
    await tx.run(sql`
      INSERT INTO stockPerformance_new (
        user_id, portfolio_id, stock_symbol, average_cost, total_shares,
        total_cost, total_dividends, realized_profit, tax_and_broker_fee,
        total_inflow, total_outflow, created_at, updated_at
      )
      SELECT 
        sp.user_id,
        pm.new_id,
        sp.stock_symbol,
        sp.average_cost,
        sp.total_shares,
        sp.total_cost,
        sp.total_dividends,
        sp.realized_profit,
        sp.tax_and_broker_fee,
        sp.total_inflow,
        sp.total_outflow,
        CASE 
          WHEN typeof(sp.created_at) = 'integer' AND sp.created_at >= 2000000000000 THEN CAST(sp.created_at / 1000 AS INTEGER)
          WHEN typeof(sp.created_at) = 'integer' THEN sp.created_at
          ELSE CAST(strftime('%s', sp.created_at) AS INTEGER)
        END,
        CASE 
          WHEN typeof(sp.updated_at) = 'integer' AND sp.updated_at >= 2000000000000 THEN CAST(sp.updated_at / 1000 AS INTEGER)
          WHEN typeof(sp.updated_at) = 'integer' THEN sp.updated_at
          ELSE CAST(strftime('%s', sp.updated_at) AS INTEGER)
        END
      FROM stockPerformance sp
      JOIN portfolio_id_mapping pm ON sp.portfolio_id = pm.old_id
    `);

    // Skipping StocksPrices migration (separate DB)

    console.log("Dropping old tables...");
    // Drop old tables
    await tx.run(sql`DROP TABLE IF EXISTS transactionTable`);
    await tx.run(sql`DROP TABLE IF EXISTS stockPerformance`);
    await tx.run(sql`DROP TABLE IF EXISTS portfolioTable`);

    console.log("Renaming new tables...");
    // Rename new tables
    await tx.run(sql`ALTER TABLE portfolioTable_new RENAME TO portfolioTable`);
    await tx.run(sql`ALTER TABLE transactionTable_new RENAME TO transactionTable`);
    await tx.run(sql`ALTER TABLE stockPerformance_new RENAME TO stockPerformance`);

    // Recreate tables with foreign key constraints and copy data back to enforce FKs
    console.log("Recreating tables to add foreign keys...");

    // transactionTable with FK
    await tx.run(sql`
      CREATE TABLE transactionTable_with_fk (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        portfolio_id INTEGER NOT NULL REFERENCES portfolioTable(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend')),
        transaction_date INTEGER NOT NULL,
        stock_symbol TEXT NOT NULL,
        number_of_shares REAL NOT NULL,
        price_per_share REAL,
        dividend_per_share REAL,
        commission_and_taxes REAL,
        is_commission_percentage INTEGER NOT NULL,
        note TEXT,
        created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
        updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
      )
    `);

    await tx.run(sql`
      INSERT INTO transactionTable_with_fk (
        id, user_id, portfolio_id, type, transaction_date, stock_symbol,
        number_of_shares, price_per_share, dividend_per_share, commission_and_taxes,
        is_commission_percentage, note, created_at, updated_at
      )
      SELECT 
        id, user_id, portfolio_id, type, transaction_date, stock_symbol,
        number_of_shares, price_per_share, dividend_per_share, commission_and_taxes,
        is_commission_percentage, note, created_at, updated_at
      FROM transactionTable
    `);

    await tx.run(sql`DROP TABLE transactionTable`);
    await tx.run(sql`ALTER TABLE transactionTable_with_fk RENAME TO transactionTable`);

    // stockPerformance with FK
    await tx.run(sql`
      CREATE TABLE stockPerformance_with_fk (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        portfolio_id INTEGER NOT NULL REFERENCES portfolioTable(id) ON DELETE CASCADE,
        stock_symbol TEXT NOT NULL,
        average_cost REAL NOT NULL DEFAULT 0,
        total_shares REAL NOT NULL DEFAULT 0,
        total_cost REAL NOT NULL DEFAULT 0,
        total_dividends REAL NOT NULL DEFAULT 0,
        realized_profit REAL NOT NULL DEFAULT 0,
        tax_and_broker_fee REAL NOT NULL DEFAULT 0,
        total_inflow REAL NOT NULL DEFAULT 0,
        total_outflow REAL NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
        updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
        UNIQUE (portfolio_id, stock_symbol)
      )
    `);

    await tx.run(sql`
      INSERT INTO stockPerformance_with_fk (
        id, user_id, portfolio_id, stock_symbol, average_cost, total_shares,
        total_cost, total_dividends, realized_profit, tax_and_broker_fee,
        total_inflow, total_outflow, created_at, updated_at
      )
      SELECT 
        id, user_id, portfolio_id, stock_symbol, average_cost, total_shares,
        total_cost, total_dividends, realized_profit, tax_and_broker_fee,
        total_inflow, total_outflow, created_at, updated_at
      FROM stockPerformance
    `);

    await tx.run(sql`DROP TABLE stockPerformance`);
    await tx.run(sql`ALTER TABLE stockPerformance_with_fk RENAME TO stockPerformance`);

    // Add foreign key constraints after renaming
    console.log("Ensuring indexes are present...");

    // Create indexes for better performance
    await tx.run(sql`CREATE INDEX idx_transaction_portfolio_id ON transactionTable(portfolio_id)`);
    await tx.run(sql`CREATE INDEX idx_stockperf_portfolio_id ON stockPerformance(portfolio_id)`);
    await tx.run(sql`CREATE INDEX idx_transaction_user_id ON transactionTable(user_id)`);
    await tx.run(sql`CREATE INDEX idx_portfolio_user_id ON portfolioTable(user_id)`);
    await tx.run(sql`CREATE INDEX idx_transaction_transaction_date ON transactionTable(transaction_date)`);

    // Re-enable foreign key constraints
    await tx.run(sql`PRAGMA foreign_keys = ON`);

    // Verify foreign key constraints
    const fkCheck = await tx.all(sql`PRAGMA foreign_key_check`);
    if (fkCheck.length > 0) {
      throw new Error(`Foreign key constraint violations detected: ${JSON.stringify(fkCheck)}`);
    }
  });

  console.log("Migration completed successfully!");

  // Post-migration validation
  const finalCounts = await db.get(sql`
    SELECT 
      (SELECT COUNT(*) FROM portfolioTable) as portfolios,
      (SELECT COUNT(*) FROM transactionTable) as transactions,
      (SELECT COUNT(*) FROM stockPerformance) as stock_performance
  `);

  console.log("Final counts:", finalCounts);
}

// Rollback function (requires backup)
export async function rollbackMigration(_db: any, _backupDb: any) {
  console.log("WARNING: This will restore from backup and lose any changes since migration!");

  // This would require a backup database to restore from
  // Implementation depends on your backup strategy
  throw new Error("Rollback requires a pre-migration backup. Please restore from your backup manually.");
}
