CREATE INDEX IF NOT EXISTS "gem_verify_evidence_items_uploader_idx"
  ON "gem_verify_evidence_items" ("uploaded_by_user_id")
  WHERE "uploaded_by_user_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "gem_verify_evidence_validations_actor_idx"
  ON "gem_verify_evidence_validations" ("checked_by_user_id")
  WHERE "checked_by_user_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "gem_verify_retention_policies_creator_idx"
  ON "gem_verify_retention_policies" ("created_by_user_id")
  WHERE "created_by_user_id" IS NOT NULL;
