/**
 * Legacy Facebook worker compatibility entrypoint.
 *
 * External publishing is canonical only in the shared social publishing worker.
 * This file intentionally contains no provider token access, queue query, or
 * direct Graph API write.
 */
export { POST } from "@/app/api/social-media/publishing/jobs/process/route";
