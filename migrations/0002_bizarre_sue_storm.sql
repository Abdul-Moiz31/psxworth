CREATE TABLE `StocksPrices` (
	`symbol` text PRIMARY KEY NOT NULL,
	`price` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `stockPerformance` ADD `total_inflow` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stockPerformance` ADD `total_outflow` real DEFAULT 0 NOT NULL;