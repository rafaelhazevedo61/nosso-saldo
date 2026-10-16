CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`target` integer NOT NULL,
	`saved` integer DEFAULT 0 NOT NULL,
	`deadline` text
);
