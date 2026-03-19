import { useState } from "react";
import { HelpCircle, Shield, Send, AlertTriangle, Clock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const tickets = [
  {
    id: "TKT-0042",
    subject: "Unable to access SIEM dashboard after permission change",
    status: "Open",
    priority: "High",
    created: "Mar 17, 2026",
  },
  {
    id: "TKT-0039",
    subject: "Request: add analyst role to new team member",
    status: "Resolved",
    priority: "Medium",
    created: "Mar 14, 2026",
  },
  {
    id: "TKT-0036",
    subject: "Export report feature returning 500 error",
    status: "In Progress",
    priority: "High",
    created: "Mar 11, 2026",
  },
];

const statusBadge: Record<string, string> = {
  Open: "bg-primary/10 text-primary border-primary/20",
  "In Progress": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Resolved: "bg-success/10 text-success border-success/20",
};

const priorityBadge: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Low: "bg-muted text-muted-foreground border-border",
};

const faqs = [
  {
    q: "How do I request access to a restricted portal section?",
    a: "Submit a support ticket with your role request and your manager's approval. The admin team will process it within 1 business day.",
  },
  {
    q: "What is the SLA for critical incident response?",
    a: "Critical incidents are triaged within 15 minutes and have a 4-hour containment target per the IR Playbook.",
  },
  {
    q: "How do I reset my MFA device?",
    a: "Contact your administrator via a support ticket marked High priority. An admin can revoke and re-enroll your MFA device.",
  },
];

export default function Support() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubject("");
    setMessage("");
    setPriority("Medium");
    toast({ title: "Ticket submitted", description: "We'll respond within 1 business day." });
  };

  return (
    <PortalLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              GEM Fortress Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit a ticket or browse answers to common questions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* New Ticket Form */}
          <div className="glass-panel rounded-xl border border-border/50 p-6">
            <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              New Ticket
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <Label htmlFor="subject" className="text-xs text-muted-foreground">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Briefly describe your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority" className="text-xs text-muted-foreground">Priority</Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-1 w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <Label htmlFor="message" className="text-xs text-muted-foreground">Message</Label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Describe the issue in detail…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="mt-1 w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
              <Button type="submit" disabled={submitting || !subject.trim() || !message.trim()} className="w-fit">
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Submitting…" : "Submit Ticket"}
              </Button>
            </form>
          </div>

          {/* FAQ */}
          <div className="glass-panel rounded-xl border border-border/50 p-6">
            <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              Frequently Asked
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-border/50 rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-sidebar-accent/30 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="glass-panel rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              Your Tickets
            </h2>
          </div>
          <div className="divide-y divide-border/40">
            {tickets.map((t) => (
              <div key={t.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${priorityBadge[t.priority]}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-sm text-foreground truncate">{t.subject}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${statusBadge[t.status]}`}>
                    {t.status}
                  </span>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t.created}</span>
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
