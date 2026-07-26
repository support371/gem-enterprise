/**
 * Legacy daily Facebook automation compatibility entrypoint.
 *
 * The previous implementation auto-approved content as `system@agent`, read a
 * duplicate Meta token store, placed credentials in Graph URLs, and created a
 * provider-specific queue. Daily execution is now limited to the authenticated
 * shared worker, which rechecks human approval and compliance evidence before
 * any external write.
 */
export { POST } from "@/app/api/social-media/publishing/jobs/process/route";
