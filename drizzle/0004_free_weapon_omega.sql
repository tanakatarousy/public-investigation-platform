CREATE TABLE `tip_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`revision_no` integer NOT NULL,
	`payload` text NOT NULL,
	`state` text DEFAULT 'revision_pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reviewed_at` text,
	`reviewed_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tip_revisions_submission_no_unique` ON `tip_revisions` (`submission_id`,`revision_no`);--> statement-breakpoint
CREATE INDEX `tip_revisions_state_idx` ON `tip_revisions` (`state`,`created_at`);--> statement-breakpoint
CREATE TABLE `tip_security_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text,
	`daily_ip_hash` text NOT NULL,
	`event` text NOT NULL,
	`turnstile_success` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tip_security_rate_idx` ON `tip_security_logs` (`daily_ip_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `tip_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`secret_hash` text NOT NULL,
	`recovery_hash` text NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`subject_slug` text,
	`case_slug` text,
	`payload` text NOT NULL,
	`exact_lat` text,
	`exact_lon` text,
	`public_lat` text,
	`public_lon` text,
	`geographic_precision` text NOT NULL,
	`temporal_precision` text NOT NULL,
	`record_type` text DEFAULT 'approved_public' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`approved_at` text,
	`withdrawn_at` text
);
--> statement-breakpoint
CREATE INDEX `tip_submissions_state_idx` ON `tip_submissions` (`state`,`updated_at`);