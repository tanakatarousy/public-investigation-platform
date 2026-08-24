CREATE TABLE `tip_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`object_key` text NOT NULL,
	`original_filename` text NOT NULL,
	`mime` text NOT NULL,
	`file_size` integer NOT NULL,
	`sha256` text NOT NULL,
	`status` text DEFAULT 'private' NOT NULL,
	`uploaded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tip_evidence_submission_idx` ON `tip_evidence` (`submission_id`,`uploaded_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `tip_evidence_object_key_unique` ON `tip_evidence` (`object_key`);--> statement-breakpoint
CREATE TABLE `tip_private_contacts` (
	`submission_id` text PRIMARY KEY NOT NULL,
	`email` text,
	`phone` text,
	`consent` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
