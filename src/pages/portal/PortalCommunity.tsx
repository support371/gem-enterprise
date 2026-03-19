import { MessageSquare, Shield, ThumbsUp, Clock, Pin, Tag } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";

const threads = [
  {
    id: "THR-001",
    title: "Best practices for MFA enforcement across hybrid environments",
    author: "Jane Smith",
    role: "Administrator",
    replies: 14,
    likes: 23,
    time: "2 hr ago",
    pinned: true,
    tags: ["MFA", "Best Practices"],
  },
  {
    id: "THR-002",
    title: "CVE-2024-1234 — patch timeline and interim mitigations",
    author: "Mike Johnson",
    role: "Analyst",
    replies: 8,
    likes: 11,
    time: "5 hr ago",
    pinned: false,
    tags: ["CVE", "Patching"],
  },
  {
    id: "THR-003",
    title: "SIEM alert tuning — reducing false positives in log correlation",
    author: "Sarah Chen",
    role: "Manager",
    replies: 21,
    likes: 34,
    time: "1 day ago",
    pinned: false,
    tags: ["SIEM", "Alerts"],
  },
  {
    id: "THR-004",
    title: "Zero Trust rollout — lessons learned from Q1 deployment",
    author: "Alex Rivera",
    role: "Manager",
    replies: 6,
    likes: 17,
    time: "2 days ago",
    pinned: false,
    tags: ["Zero Trust", "Deployment"],
  },
  {
    id: "THR-005",
    title: "Incident response checklist review — proposing Q2 updates",
    author: "Dana Lee",
    role: "Analyst",
    replies: 9,
    likes: 8,
    time: "3 days ago",
    pinned: false,
    tags: ["IR", "Documentation"],
  },
];

const tagColors: Record<string, string> = {
  MFA: "bg-primary/10 text-primary border-primary/20",
  "Best Practices": "bg-success/10 text-success border-success/20",
  CVE: "bg-destructive/10 text-destructive border-destructive/20",
  Patching: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  SIEM: "bg-primary/10 text-primary border-primary/20",
  Alerts: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Zero Trust": "bg-success/10 text-success border-success/20",
  Deployment: "bg-primary/10 text-primary border-primary/20",
  IR: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Documentation: "bg-muted text-muted-foreground border-border",
};

export default function PortalCommunity() {
  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              GEM Fortress Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Team discussions, knowledge sharing, and security best practices.
          </p>
        </div>

        {/* Threads */}
        <div className="glass-panel rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Discussions
            </h2>
            <span className="text-xs text-muted-foreground">{threads.length} threads</span>
          </div>
          <div className="divide-y divide-border/40">
            {threads.map((thread) => (
              <div key={thread.id} className="px-5 py-4 hover:bg-sidebar-accent/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{thread.author[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {thread.pinned && (
                        <Pin className="w-3 h-3 text-primary shrink-0" />
                      )}
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {thread.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {thread.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs font-medium px-1.5 py-0.5 rounded border ${tagColors[tag] || "bg-muted text-muted-foreground border-border"}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/70">{thread.author}</span>
                      <span>{thread.role}</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{thread.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{thread.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{thread.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
