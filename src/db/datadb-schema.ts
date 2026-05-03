import { bigint, date, index, pgTable, real, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const usersTable = pgTable("Users", {
  username: text("username").primaryKey().notNull(),
  password: text("password").notNull(),
  isActive: text("isActive").default("true").notNull(),
});

export const stocksPricesTable = pgTable("StocksPrices", {
  symbol: text("symbol").primaryKey().notNull(),
  price: text("price").notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull(),
});

// Payouts: dividend, bonus, split, right
export const payouts = pgTable(
  "payouts",
  {
    id: serial("id").primaryKey(),
    naturalKey: text("naturalKey").notNull().unique(),
    symbol: text("symbol").notNull(),
    name: text("name"),
    logoUrl: text("logoUrl"),
    actionType: text("actionType").notNull(), // 'dividend' | 'bonus' | 'split' | 'right'
    exDate: date("exDate", { mode: "date" }).notNull(),
    percentValue: real("percentValue"),
    faceValue: real("faceValue"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_payouts_exDate").on(table.exDate),
    index("idx_payouts_symbol_exDate").on(table.symbol, table.exDate),
  ]
);

// Financial results: independent of payouts
export const financialResults = pgTable(
  "financialResults",
  {
    id: serial("id").primaryKey(),
    naturalKey: text("naturalKey").notNull().unique(),
    symbol: text("symbol").notNull(),
    name: text("name"),
    logoUrl: text("logoUrl"),
    postingDate: date("postingDate", { mode: "date" }).notNull(),
    periodEnded: date("periodEnded", { mode: "date" }),
    closeFrom: date("closeFrom", { mode: "date" }),
    closeTo: date("closeTo", { mode: "date" }),
    announcementTitle: text("announcementTitle"),
    dividendPercentRaw: text("dividendPercentRaw"),
    dividendRaw: text("dividendRaw"),
    attachmentsJson: text("attachmentsJson"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_financial_results_postingDate").on(table.postingDate),
    index("idx_financial_results_symbol_postingDate").on(table.symbol, table.postingDate),
  ]
);

// ETF Baskets: stores the main basket information
export const etfBaskets = pgTable(
  "etfBaskets",
  {
    symbol: text("symbol").primaryKey().notNull(),
    cashComponent: real("cashComponent"),
    cashComponentPercent: real("cashComponentPercent"),
    asOfDate: text("asOfDate"), // Stored as string since it comes from HTML parsing
    sourceUrl: text("sourceUrl").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("idx_etf_baskets_symbol").on(table.symbol)]
);

// ETF Basket Holdings: individual holdings within each ETF basket
export const etfBasketHoldings = pgTable(
  "etfBasketHoldings",
  {
    id: serial("id").primaryKey(),
    etfSymbol: text("etfSymbol")
      .notNull()
      .references(() => etfBaskets.symbol, { onDelete: "cascade" }),
    holdingSymbol: text("holdingSymbol").notNull(),
    name: text("name").notNull(),
    shares: real("shares").notNull(),
    href: text("href"),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_etf_basket_holdings_etfSymbol").on(table.etfSymbol),
    index("idx_etf_basket_holdings_holdingSymbol").on(table.holdingSymbol),
    index("idx_etf_basket_holdings_etf_holding").on(table.etfSymbol, table.holdingSymbol),
    uniqueIndex("uq_etf_basket_holdings_etf_holding").on(table.etfSymbol, table.holdingSymbol),
  ]
);

// Historical Prices: time-series price data for stocks
export const historicalPrices = pgTable(
  "historicalPrices",
  {
    id: serial("id").primaryKey(),
    symbol: text("symbol").notNull(),
    date: date("date", { mode: "date" }).notNull(),
    ldcp: real("ldcp"), // Last Day Closing Price
    open: real("open"),
    high: real("high"),
    low: real("low"),
    close: real("close"),
    adjustedClose: real("adjustedClose"), // Price adjusted for dividends, splits, etc.
    change: real("change"),
    changePercent: real("changePercent"),
    volume: bigint("volume", { mode: "number" }),
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_historical_prices_symbol").on(table.symbol),
    index("idx_historical_prices_date").on(table.date),
    uniqueIndex("uq_historical_prices_symbol_date").on(table.symbol, table.date),
  ]
);

// Background Jobs: generic table for tracking async background job execution
export const backgroundJobs = pgTable(
  "backgroundJobs",
  {
    id: serial("id").primaryKey(),
    jobId: text("jobId").notNull().unique(),
    jobType: text("jobType").notNull(), // e.g., 'historical-prices-range', 'payouts-update', etc.
    status: text("status").notNull(), // 'pending' | 'processing' | 'completed' | 'failed'
    input: text("input").notNull(), // JSON string of input parameters
    result: text("result"), // JSON string of result/output (null until completed)
    error: text("error"), // Error message if failed
    createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    startedAt: timestamp("startedAt", { withTimezone: true, mode: "date" }),
    completedAt: timestamp("completedAt", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("idx_background_jobs_jobId").on(table.jobId),
    index("idx_background_jobs_jobType").on(table.jobType),
    index("idx_background_jobs_status").on(table.status),
    index("idx_background_jobs_createdAt").on(table.createdAt),
  ]
);
