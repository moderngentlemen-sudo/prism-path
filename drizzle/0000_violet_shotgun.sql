CREATE TABLE `activity` (
	`uid` text NOT NULL,
	`day` text NOT NULL,
	PRIMARY KEY(`uid`, `day`)
);
--> statement-breakpoint
CREATE TABLE `best` (
	`uid` text NOT NULL,
	`puzzle` text NOT NULL,
	`points` integer NOT NULL,
	`stars` integer NOT NULL,
	`moves` integer NOT NULL,
	PRIMARY KEY(`uid`, `puzzle`)
);
--> statement-breakpoint
CREATE TABLE `finishes` (
	`id` text PRIMARY KEY NOT NULL,
	`uid` text NOT NULL,
	`puzzle` text NOT NULL,
	`points` integer NOT NULL,
	`stars` integer NOT NULL,
	`moves` integer NOT NULL,
	`hints` integer NOT NULL,
	`seconds` real NOT NULL,
	`day` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `finishes_player` ON `finishes` (`uid`);--> statement-breakpoint
CREATE TABLE `players` (
	`uid` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`listed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`uid` text NOT NULL,
	`period` text NOT NULL,
	`kind` text NOT NULL,
	`points` integer NOT NULL,
	`streak` integer NOT NULL,
	PRIMARY KEY(`uid`, `period`, `kind`)
);
--> statement-breakpoint
CREATE TABLE `wallet_entries` (
	`uid` text NOT NULL,
	`reason` text NOT NULL,
	`amount` integer NOT NULL,
	PRIMARY KEY(`uid`, `reason`)
);
