CREATE TABLE `guest_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`uid` text NOT NULL,
	`puzzle` text NOT NULL,
	`day` text NOT NULL,
	`target` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `guest_claims_player` ON `guest_claims` (`uid`);