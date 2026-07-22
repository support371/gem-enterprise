-- Cover the short-lived actor foreign key used for user-deletion cleanup and diagnostics.
CREATE INDEX "social_oauth_authorization_attempts_actor_id_idx"
ON "social_oauth_authorization_attempts"("actor_id");
