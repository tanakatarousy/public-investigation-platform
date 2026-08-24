CREATE UNIQUE INDEX `content_records_kind_slug_unique` ON `content_records` (`kind`,`slug`);--> statement-breakpoint
CREATE INDEX `content_records_public_idx` ON `content_records` (`publish_state`,`kind`);--> statement-breakpoint
CREATE INDEX `trend_metrics_day_idx` ON `trend_metrics_daily` (`day`,`sampled_views`);--> statement-breakpoint
CREATE UNIQUE INDEX `trend_samples_daily_dedupe_unique` ON `trend_samples` (`day`,`dedupe_hash`);