CREATE TABLE `credit_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`credit_limit` integer NOT NULL,
	`closing_day` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `credit_charges` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_id` text NOT NULL,
	`card_id` text NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`date` text NOT NULL,
	`invoice` text NOT NULL,
	`installment` integer NOT NULL,
	`installments` integer NOT NULL,
	`person` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `credit_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`invoice` text NOT NULL
);
