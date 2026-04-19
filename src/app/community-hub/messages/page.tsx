"use client";

import { useState } from "react";
import {
  MessageSquare,
  Lock,
  Send,
  Paperclip,
  Search,
  ShieldCheck,
  CircleDot,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CONVERSATIONS = [
  {
    id: "c-1",
    name: "M. Harrington",
    company: "Meridian Capital",
    preview: "Happy to take this forward — copying my counsel to the thread...",
    time: "12m",
    unread: 1,
    verified: true,
    online: true,
  },
  {
    id: "c-2",
    name: "GEM Concierge",
    company: "Network Operations",
    preview: "Your introduction request to Northstar Realty has been accepted.",
    time: "2h",
    unread: 2,
    verified: true,
    online: true,
  },
  {
    id: "c-3",
    name: "Priya Nambiar",
    company: "Northstar Realty",
    preview: "Scoping document is in the data room. Let's set a call next week.",
    time: "Yesterday",
    unread: 0,
    verified: true,
    online: false,
  },
  {
    id: "c-4",
    name: "GEM Compliance",
    company: "Regulatory Desk",
    preview: "Cross-border memo attached — please confirm receipt for the file.",
    time: "2d",
    unread: 0,
    verified: true,
    online: false,
  },
  {
    id: "c-5",
    name: "S. Patel",
    company: "Sovereign Risk",
    preview: "Aligned on structure. Will circulate term sheet before the weekend.",
    time: "3d",
    unread: 0,
    verified: true,
    online: true,
  },
];

const MESSAGES = [
  {
    id: "m-1",
    from: "them",
    author: "M. Harrington",
    time: "09:42",
    body: "Confirming receipt of your note on the GCC corridor co-invest. We're engaged on our side — opening a data room for the working group.",
  },
  {
    id: "m-2",
    from: "me",
    author: "You",
    time: "09:48",
    body: "Appreciated. Timing works — our team can review within 48 hours and revert with scoping questions directly into the room.",
  },
  {
    id: "m-3",
    from: "them",
    author: "M. Harrington",
    time: "10:11",
    body: "Perfect. I'll copy counsel on the thread and share anchor terms once they're finalised tonight.",
  },
];

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].id);
  const [draft, setDraft] = useState("");

  const active = CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0];

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
            <MessageSquare className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Secure Messaging</h1>
            <p className="text-xs text-white/45">
              End-to-end audited member communications
            </p>
          </div>
        </div>
        <Badge className="rounded-full border border-primary/25 bg-primary/8 font-mono text-[10px] uppercase tracking-wider text-primary/90">
          <Lock className="mr-1 h-3 w-3" aria-hidden="true" />
          Encrypted · audited
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,280px)]">
        {/* Conversations list */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
              aria-hidden="true"
            />
            <Input
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="h-9 border-white/10 bg-white/[0.02] pl-9 text-xs placeholder:text-white/35"
            />
          </div>
          <ul className="flex flex-col gap-1" role="list">
            {CONVERSATIONS.map((c) => {
              const isActive = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    aria-pressed={isActive}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                      isActive
                        ? "border-primary/25 bg-primary/5"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div
                        aria-hidden="true"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-mono text-xs font-semibold text-primary"
                      >
                        {c.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      {c.online && (
                        <span
                          aria-label="Online"
                          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0e1420]"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {c.name}
                        </p>
                        <span className="shrink-0 text-[11px] text-white/40">
                          {c.time}
                        </span>
                      </div>
                      <p className="truncate text-[11px] font-mono uppercase tracking-wider text-primary/70">
                        {c.company}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-white/50">
                        {c.preview}
                      </p>
                    </div>
                    {c.unread > 0 && (
                      <span
                        aria-label={`${c.unread} unread messages`}
                        className="mt-1 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 font-mono text-[10px] font-semibold text-primary-foreground"
                      >
                        {c.unread}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Thread */}
        <div className="flex min-h-[560px] flex-col rounded-2xl border border-white/[0.07] bg-[#0e1420]">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-mono text-sm font-semibold text-primary"
                >
                  {active.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                {active.online && (
                  <span
                    aria-label="Online"
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0e1420]"
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {active.name}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-primary/70">
                  {active.company}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-white/45">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/70" aria-hidden="true" />
              Verified member
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
            {MESSAGES.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex w-full",
                  m.from === "me" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.from === "me"
                      ? "bg-primary/15 text-foreground ring-1 ring-primary/25"
                      : "bg-white/[0.04] text-white/85 ring-1 ring-white/[0.05]"
                  )}
                >
                  <div className="mb-1 flex items-center gap-2 text-[11px] text-white/45">
                    <span className="font-medium text-white/70">{m.author}</span>
                    <span>·</span>
                    <span>{m.time}</span>
                  </div>
                  <p className="text-pretty">{m.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.05] px-5 py-4">
            <div className="flex gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write an on-record message..."
                aria-label="Compose message"
                rows={2}
                className="min-h-0 flex-1 resize-none border-white/10 bg-white/[0.02] text-sm placeholder:text-white/35"
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Attach file"
                  className="border border-white/10 bg-transparent text-white/55 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  <Paperclip className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  aria-label="Send message"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-white/35">
              Messages are encrypted in transit and logged to the compliance audit
              trail. Attachments must match member entitlements.
            </p>
          </div>
        </div>

        {/* Shared context rail */}
        <aside className="hidden flex-col gap-3 rounded-2xl border border-white/[0.07] bg-[#0e1420] p-5 lg:flex">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Shared context
          </p>
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
            <p className="text-xs text-white/45">Linked mandate</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              GCC Logistics corridor — Co-invest
            </p>
            <p className="mt-1 text-[11px] text-white/40">
              Ref: OP-2601 · Verified
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
            <p className="text-xs text-white/45">Open requests</p>
            <ul className="mt-2 space-y-1.5 text-xs text-white/75">
              {[
                { id: "REQ-8821", label: "Intro · Logistics GCC", status: "Under review" },
                { id: "REQ-8814", label: "Mandate · Multi-family NE US", status: "Matched" },
              ].map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{r.label}</span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-primary/75">
                    <CircleDot className="h-3 w-3" aria-hidden="true" />
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
            <p className="text-xs text-white/45">Compliance note</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/55">
              This thread is considered material communication. Retain for
              regulatory records.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
