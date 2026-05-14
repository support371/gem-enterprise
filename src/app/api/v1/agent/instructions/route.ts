import { NextResponse } from "next/server";
import { agentOperatingInstructions } from "@/lib/saasOperationsRegistry";

export async function GET() {
  return NextResponse.json({
    instructions: agentOperatingInstructions,
    flow: [
      "Verify platform environment access.",
      "Connect or sync support371/gem-enterprise.",
      "Manage organization, users, roles, and permissions through approved admin surfaces.",
      "Plan enterprise work through projects, tasks, risks, and milestones.",
      "Build and deploy through development endpoints or connected GitHub/Vercel tools.",
      "Monitor production health and incidents.",
      "Run cybersecurity assets, scans, vulnerabilities, assessments, and recommendations only for authorized assets.",
      "Automate recurring workflows after explicit approval.",
      "Manage support, analytics, billing, marketing, sales, integrations, notifications, and audit controls.",
    ],
  });
}
