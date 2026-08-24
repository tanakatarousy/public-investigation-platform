CREATE TABLE `content_records` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`payload` text NOT NULL,
	`publish_state` text DEFAULT 'draft' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`published_at` text,
	`withdrawn_at` text,
	`correction_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trend_metrics_daily` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`sampled_views` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trend_samples` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`dedupe_hash` text NOT NULL,
	`dwell_seconds` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
