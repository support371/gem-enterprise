import { Users, Mail, Shield, CheckCircle2, Clock, XCircle } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// DiceBear initials-style avatars for team members
function getMemberAvatar(name: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1e3a5f,0f172a&textColor=60a5fa&fontSize=38&fontWeight=600`;
}

type MemberRole = "admin" | "manager" | "analyst" | "viewer";
type OnlineStatus = "Online" | "Away" | "Offline";

interface TeamMember {
  name: string;
  email: string;
  title: string;
  role: MemberRole;
  status: OnlineStatus;
  joined: string;
}

const team: TeamMember[] = [
  { name: "Jane Smith", email: "j.smith@gem.io", title: "Security Lead", role: "admin", status: "Online", joined: "Jan 2023" },
  { name: "Mike Johnson", email: "m.johnson@gem.io", title: "SOC Manager", role: "manager", status: "Online", joined: "Mar 2023" },
  { name: "Sarah Chen", email: "s.chen@gem.io", title: "Threat Analyst", role: "analyst", status: "Away", joined: "Jun 2023" },
  { name: "Tom Wilson", email: "t.wilson@gem.io", title: "Security Analyst", role: "analyst", status: "Offline", joined: "Aug 2023" },
  { name: "Priya Patel", email: "p.patel@gem.io", title: "Cloud Security Engineer", role: "analyst", status: "Online", joined: "Sep 2023" },
  { name: "Alex Reed", email: "a.reed@gem.io", title: "CISO (Executive)", role: "viewer", status: "Online", joined: "Feb 2023" },
  { name: "Jordan Kim", email: "j.kim@gem.io", title: "Compliance Officer", role: "viewer", status: "Online", joined: "Nov 2023" },
  { name: "Casey Morgan", email: "c.morgan@gem.io", title: "Incident Coordinator", role: "manager", status: "Offline", joined: "Dec 2023" },
];

const roleStyle: Record<MemberRole, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  manager: "bg-secondary text-foreground border-border",
  analyst: "bg-secondary text-foreground border-border",
  viewer: "bg-muted text-muted-foreground border-border",
};

const roleLabel: Record<MemberRole, string> = {
  admin: "Admin",
  manager: "Manager",
  analyst: "Analyst",
  viewer: "Viewer",
};

const StatusIcon = ({ status }: { status: OnlineStatus }) => {
  if (status === "Online") return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
  if (status === "Away") return <Clock className="w-3.5 h-3.5 text-yellow-400" />;
  return <XCircle className="w-3.5 h-3.5 text-muted-foreground" />;
};

const statusText: Record<OnlineStatus, string> = {
  Online: "text-success",
  Away: "text-yellow-400",
  Offline: "text-muted-foreground",
};

export default function PortalTeam() {
  const online = team.filter((m) => m.status === "Online").length;

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Team</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {team.length} members — {online} online now
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member) => (
            <div
              key={member.email}
              className="glass-panel rounded-xl border border-border/50 p-4 hover:border-primary/20 transition-colors"
            >
              {/* Avatar + Status */}
              <div className="flex items-start justify-between mb-3">
                <Avatar className="w-10 h-10 ring-2 ring-border group-hover:ring-primary/30 transition-colors">
                  <AvatarImage src={getMemberAvatar(member.name)} alt={member.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5">
                  <StatusIcon status={member.status} />
                  <span className={`text-xs font-medium ${statusText[member.status]}`}>
                    {member.status}
                  </span>
                </div>
              </div>

              {/* Info */}
              <h3 className="text-sm font-semibold text-foreground">{member.name}</h3>
              <p className="text-xs text-muted-foreground">{member.title}</p>

              {/* Meta row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </a>
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded border ml-2 ${roleStyle[member.role]}`}>
                  <Shield className="w-2.5 h-2.5 inline mr-0.5" />
                  {roleLabel[member.role]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
