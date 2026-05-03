CREATE TABLE `stockPerformance` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`portfolio_id` text NOT NULL,
	`stock_symbol` text NOT NULL,
	`average_cost` real DEFAULT 0 NOT NULL,
	`total_shares` real DEFAULT 0 NOT NULL,
	`total_cost` real DEFAULT 0 NOT NULL,
	`total_dividends` real DEFAULT 0 NOT NULL,
	`realized_profit` real DEFAULT 0 NOT NULL,
	`tax_and_broker_fee` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolioTable`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transactionTable` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`portfolio_id` text NOT NULL,
	`type` text NOT NULL,
	`transaction_date` text NOT NULL,
	`stock_symbol` text NOT NULL,
	`number_of_shares` real NOT NULL,
	`price_per_share` real,
	`dividend_per_share` real,
	`commission_and_taxes` real,
	`is_commission_percentage` integer NOT NULL,
	`note` text(1000),
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`portfolio_id`) REFERENCES `portfolioTable`(`id`) ON UPDATE no action ON DELETE cascade
);
