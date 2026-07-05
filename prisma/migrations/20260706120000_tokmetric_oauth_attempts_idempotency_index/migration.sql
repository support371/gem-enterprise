-- CreateTable
CREATE TABLE "tokmetric_oauth_authorization_attempts" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "provider" "TokMetricConnectorProvider" NOT NULL,
    "environment" TEXT NOT NULL,
    "encryptedCodeVerifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "tokmetric_oauth_authorization_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokmetric_oauth_authorization_attempts_nonce_key" ON "tokmetric_oauth_authorization_attempts"("nonce");

-- CreateIndex
CREATE INDEX "tokmetric_oauth_authorization_attempts_expiresAt_idx" ON "tokmetric_oauth_authorization_attempts"("expiresAt");

-- CreateIndex
CREATE INDEX "tokmetric_oauth_authorization_attempts_workspaceId_actorId_idx" ON "tokmetric_oauth_authorization_attempts"("workspaceId", "actorId");

-- CreateIndex
CREATE INDEX "tokmetric_oauth_authorization_attempts_consumedAt_idx" ON "tokmetric_oauth_authorization_attempts"("consumedAt");

-- CreateIndex
CREATE INDEX "tokmetric_idempotency_records_expiresAt_idx" ON "tokmetric_idempotency_records"("expiresAt");

-- AddForeignKey
ALTER TABLE "tokmetric_oauth_authorization_attempts" ADD CONSTRAINT "tokmetric_oauth_authorization_attempts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "tokmetric_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokmetric_oauth_authorization_attempts" ADD CONSTRAINT "tokmetric_oauth_authorization_attempts_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
