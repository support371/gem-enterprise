const canonicalProjectId = "prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z";
const canonicalMarkers = [
  "support371-gem-enterprise",
  "www.gemcybersecurityassist.com",
  "gemcybersecurityassist.com",
];
const knownDuplicateMarkers = [
  "project-dtrl6",
  "gem-enterprise-admin-25521151s-projects",
  "gem-enterprise-git-",
];

const projectId = process.env.VERCEL_PROJECT_ID?.trim() || "";
const deploymentSignals = [
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_TARGET_ENV,
]
  .filter((value) => typeof value === "string" && value.trim().length > 0)
  .map((value) => value.trim().toLowerCase());

function continueBuild(reason) {
  console.log(`[vercel-ignore] Continue build: ${reason}`);
  process.exit(1);
}

function ignoreBuild(reason) {
  console.log(`[vercel-ignore] Ignore build: ${reason}`);
  process.exit(0);
}

if (projectId) {
  if (projectId === canonicalProjectId) {
    continueBuild(`canonical project ID ${canonicalProjectId}`);
  }

  ignoreBuild(
    `non-canonical project ID ${projectId}; canonical project is ${canonicalProjectId}`,
  );
}

if (
  deploymentSignals.some((signal) =>
    canonicalMarkers.some((marker) => signal.includes(marker)),
  )
) {
  continueBuild(`canonical project marker detected in ${deploymentSignals.join(", ")}`);
}

if (
  deploymentSignals.some((signal) =>
    knownDuplicateMarkers.some((marker) => signal.includes(marker)),
  )
) {
  ignoreBuild(`known duplicate marker detected in ${deploymentSignals.join(", ")}`);
}

if (process.env.VERCEL === "1" || process.env.CI === "1") {
  ignoreBuild(
    "Vercel project identity could not be verified. Failing closed to prevent an unknown or duplicate project from consuming build capacity.",
  );
}

continueBuild("local non-Vercel environment");
