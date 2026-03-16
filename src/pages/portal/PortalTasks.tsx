import { useState } from "react";
import { ClipboardList, Clock, User, Flag } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { cn } from "@/lib/utils";

type TaskStatus = "Open" | "In Progress" | "Completed";
type TaskPriority = "Critical" | "High" | "Medium" | "Low";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  due: string;
}

const tasks: Task[] = [
  { id: "TASK-0045", title: "Patch CVE-2024-44228 on web servers", description: "Critical RCE vulnerability affecting Apache Log4j. Immediate patching required.", priority: "Critical", status: "In Progress", assignee: "Sarah Chen", due: "Today" },
  { id: "TASK-0044", title: "Review and update firewall ruleset", description: "Quarterly audit of inbound/outbound firewall rules across all edge nodes.", priority: "High", status: "Open", assignee: "Mike Johnson", due: "Mar 18" },
  { id: "TASK-0043", title: "Investigate anomalous outbound traffic", description: "SIEM flagged unusual data transfer volumes from subnet 10.0.4.0/24.", priority: "High", status: "In Progress", assignee: "Sarah Chen", due: "Mar 17" },
  { id: "TASK-0042", title: "Update incident response playbook", description: "Incorporate lessons learned from Q1 tabletop exercise.", priority: "Medium", status: "Open", assignee: "Mike Johnson", due: "Mar 22" },
  { id: "TASK-0041", title: "SOC 2 Type II evidence collection", description: "Gather audit evidence for access control and monitoring controls.", priority: "Medium", status: "Open", assignee: "Jane Smith", due: "Mar 25" },
  { id: "TASK-0040", title: "Rotate API keys for third-party integrations", description: "Scheduled key rotation — 90-day policy compliance.", priority: "Low", status: "Completed", assignee: "Tom Wilson", due: "Mar 14" },
];

const priorityBadge: Record<TaskPriority, string> = {
  Critical: "bg-destructive/10 text-destructive border-destructive/20",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Low: "bg-muted text-muted-foreground border-border",
};

const statusBadge: Record<TaskStatus, string> = {
  Open: "bg-primary/10 text-primary",
  "In Progress": "bg-yellow-500/10 text-yellow-400",
  Completed: "bg-success/10 text-success",
};

const filters: (TaskStatus | "All")[] = ["All", "Open", "In Progress", "Completed"];

export default function PortalTasks() {
  const [filter, setFilter] = useState<TaskStatus | "All">("All");

  const visible = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Tasks</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Security Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage remediation work, audits, and operational tasks.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/30 w-fit">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
              <span className="ml-1.5 text-muted-foreground">
                {f === "All" ? tasks.length : tasks.filter((t) => t.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {visible.map((task) => (
            <div
              key={task.id}
              className="glass-panel rounded-xl border border-border/50 p-4 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${priorityBadge[task.priority]}`}>
                      <Flag className="w-2.5 h-2.5 inline mr-0.5" />
                      {task.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{task.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${statusBadge[task.status]}`}>
                  {task.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  {task.assignee}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  Due: {task.due}
                </div>
              </div>
            </div>
          ))}

          {visible.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No tasks matching the selected filter.
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
