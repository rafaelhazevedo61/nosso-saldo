CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`person` text NOT NULL,
	`date` text NOT NULL
);
