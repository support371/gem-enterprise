-- Cover queue foreign keys used by connector cleanup and actor investigations.
CREATE INDEX "social_publishing_jobs_connector_id_idx"
ON "social_publishing_jobs"("connector_id");

CREATE INDEX "social_publishing_jobs_requested_by_id_idx"
ON "social_publishing_jobs"("requested_by_id");
