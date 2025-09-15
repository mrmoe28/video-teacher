CREATE INDEX "decks_video_id_idx" ON "decks" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_video_id_idx" ON "jobs" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "slides_deck_id_idx" ON "slides" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "slides_idx_order_idx" ON "slides" USING btree ("deck_id","idx");--> statement-breakpoint
CREATE INDEX "transcripts_video_id_idx" ON "transcripts" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "transcripts_source_idx" ON "transcripts" USING btree ("source");--> statement-breakpoint
CREATE INDEX "videos_url_idx" ON "videos" USING btree ("url");--> statement-breakpoint
CREATE INDEX "videos_channel_idx" ON "videos" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");