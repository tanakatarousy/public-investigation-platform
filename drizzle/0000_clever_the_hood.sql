CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`detail` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`reply_requested` integer DEFAULT false NOT NULL,
	`email` text,
	`status` text DEFAULT 'new' NOT NULL,
	`risk_level` text DEFAULT 'low' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inquiry_security_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_id` text,
	`client_ip` text,
	`cf_ray` text,
	`user_agent` text,
	`country_code` text,
	`turnstile_success` integer DEFAULT false NOT NULL,
	`rate_limit_result` text NOT NULL,
	`request_body_size` integer NOT NULL,
	`abuse_score` integer DEFAULT 0 NOT NULL,
	`legal_hold` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` text NOT NULL
);
