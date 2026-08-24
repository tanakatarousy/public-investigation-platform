CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_hash` text NOT NULL,
	`path` text NOT NULL,
	`referrer_path` text,
	`dwell_seconds` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_events_visitor_idx` ON `analytics_events` (`visitor_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_path_idx` ON `analytics_events` (`path`,`created_at`);--> statement-breakpoint
CREATE TABLE `analytics_visitors` (
	`visitor_hash` text PRIMARY KEY NOT NULL,
	`display_id` text NOT NULL,
	`excluded` integer DEFAULT false NOT NULL,
	`first_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`total_views` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_visitors_display_id_unique` ON `analytics_visitors` (`display_id`);--> statement-breakpoint
CREATE INDEX `analytics_visitors_last_seen_idx` ON `analytics_visitors` (`excluded`,`last_seen_at`);