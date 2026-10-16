CREATE TABLE `wallets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`initial_balance` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `transactions` ADD `wallet_id` text DEFAULT 'main' NOT NULL;