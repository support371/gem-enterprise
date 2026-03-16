import { Activity, CheckCircle2, AlertTriangle, LogIn, Settings, FileText, Trash2 } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getActorAvatar(actor: string): string {
  if (actor === "System") return "";
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(actor)}&backgroundColor=1e3a5f,0f172a&textColor=60a5fa&fontSize=38&fontWeight=600`;
}

type EventType = "login" | "incident" | "task" | "system" | "settings" | "document" | "delete";

interface ActivityEvent {
  id: string;
  type: EventType;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
}

const events: ActivityEvent[] = [
  { id: "EVT-1001", type: "incident", actor: "Jane Smith", action: "Updated status to Active", resource: "INC-2024-003", timestamp: "Mar 16, 10:00" },
  { id: "EVT-1000", type: "task", actor: "Mike Johnson", action: "Assigned task to Sarah Chen", resource: "TASK-0043", timestamp: "Mar 16, 09:48" },
  { id: "EVT-0999", type: "login", actor: "Jane Smith", action: "Signed in", resource: "Portal", timestamp: "Mar 16, 09:41" },
  { id: "EVT-0998", type: "incident", actor: "Sarah Chen", action: "Added investigation note", resource: "INC-2024-001", timestamp: "Mar 16, 08:15" },
  { id: "EVT-0997", type: "system", actor: "System", action: "Completed scheduled backup", resource: "All 14 nodes", timestamp: "Mar 16, 03:00" },
  { id: "EVT-0996", type: "task", actor: "Tom Wilson", action: "Marked task Completed", resource: "TASK-0040", timestamp: "Mar 15, 17:30" },
  { id: "EVT-0995", type: "login", actor: "Priya Patel", action: "Signed in", resource: "Portal", timestamp: "Mar 15, 16:02" },
  { id: "EVT-0994", type: "incident", actor: "Mike Johnson", action: "Opened incident", resource: "INC-2024-004", timestamp: "Mar 15, 14:17" },
  { id: "EVT-0993", type: "document", actor: "Jane Smith", action: "Updated playbook document", resource: "IR-Playbook-v3.pdf", timestamp: "Mar 15, 13:44" },
  { id: "EVT-0992", type: "settings", actor: "Jane Smith", action: "Updated session timeout policy", resource: "Portal Settings", timestamp: "Mar 15, 11:00" },
  { id: "EVT-0991", type: "delete", actor: "Tom Wilson", action: "Removed stale API key", resource: "Key: svc-monitor-legacy", timestamp: "Mar 14, 16:20" },
  { id: "EVT-0990", type: "task", actor: "Sarah Chen", action: "Created task", resource: "TASK-0045", timestamp: "Mar 14, 15:05" },
];

const eventIcon: Record<EventType, React.ElementType> = {
  login: LogIn,
  incident: AlertTriangle,
  task: CheckCircle2,
  system: Activity,
  settings: Settings,
  document: FileText,
  delete: Trash2,
};

const eventColor: Record<EventType, string> = {
  login: "text-primary bg-primary/10 border-primary/20",
  incident: "text-destructive bg-destructive/10 border-destructive/20",
  task: "text-success bg-success/10 border-success/20",
  system: "text-muted-foreground bg-muted border-border",
  settings: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  document: "text-primary bg-primary/10 border-primary/20",
  delete: "text-destructive bg-destructive/10 border-destructive/20",
};

export default function PortalActivity() {
  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Activity</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit trail of all portal actions across incidents, tasks, and system events.
          </p>
        </div>

        {/* Event Feed */}
        <div className="glass-panel rounded-xl border border-border/50 overflow-hidden">
          <div className="divide-y divide-border/40">
            {events.map((event, idx) => {
              const Icon = eventIcon[event.type];
              const color = eventColor[event.type];
              return (
                <div key={event.id} className="flex items-start gap-4 px-5 py-4">
                  {/* Actor Avatar */}
                  {event.actor === "System" ? (
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <Avatar className="w-8 h-8 shrink-0 mt-0.5 ring-1 ring-border">
                      <AvatarImage src={getActorAvatar(event.actor)} alt={event.actor} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {event.actor.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${color}`}>
                        <Icon className="w-2.5 h-2.5" />
                      </div>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{event.actor}</span>{" "}
                        <span className="text-muted-foreground">{event.action}</span>{" "}
                        <span className="font-medium text-primary">{event.resource}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                      <span className="text-xs font-mono text-muted-foreground/50">{event.id}</span>
                    </div>
                  </div>

                  {/* Connector line for all but last */}
                  {idx < events.length - 1 && (
                    <div className="absolute left-[2.875rem] mt-10 h-4 w-px bg-border/40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
