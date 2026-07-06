const canonicalProjectId = "prj_VDGqnA7wZt2E65LLvT94ZOpnYc2Z";
const currentProjectId = process.env.VERCEL_PROJECT_ID?.trim();

if (!currentProjectId) {
  console.log("VERCEL_PROJECT_ID is unavailable; continue the build safely.");
  process.exit(1);
}

if (currentProjectId === canonicalProjectId) {
  console.log(`Canonical Vercel project ${canonicalProjectId}; continue the build.`);
  process.exit(1);
}

console.log(`Ignoring duplicate Vercel project ${currentProjectId}; canonical project is ${canonicalProjectId}.`);
process.exit(0);
