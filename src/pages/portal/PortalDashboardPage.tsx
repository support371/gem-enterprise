import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { readDb } from "@/lib/platform";
import { PortalSupportEntry } from "@/components/support/PortalSupportEntry";

export default function PortalDashboardPage() {
  const { user } = useAuth();
  const db = readDb();

  if (!user) return <Navigate to="/client-login" replace />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Portal Dashboard</h1>
        <p className="mt-2 text-slate-400">Main portal dashboard with AI concierge support entry point.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Active Incidents", "3"],
          ["Pending Requests", String(db.requests.length)],
          ["Compliance Score", "94%"],
          ["Open Tickets", String(db.supportTickets.length)],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Concierge Support Slice</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300">
          Use <strong>Talk to Concierge</strong> to start a support session, accept consent, exchange messages, escalate to human handoff,
          create a ticket, or book help.
        </CardContent>
      </Card>

      <PortalSupportEntry user={user} />
    </div>
  );
}
