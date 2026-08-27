"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { ChevronRight, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceOSNavItem {
  id: string;
  label: string;
  description: string;
  href: string;
}

const pendingFocusKey = "gem:workspace-navigation-focus";
const navigationGroupOrder = ["Workspace", "Platform", "Governance"] as const;
type NavigationGroup = (typeof navigationGroupOrder)[number];

const workspaceEnvironmentIds = new Set([
  "overview",
  "production",
  "development",
  "marketing",
  "sales",
  "finance",
  "team",
  "client",
]);
const platformEnvironmentIds = new Set(["services", "tools", "monitoring"]);

function navigationGroupFor(item: WorkspaceOSNavItem): NavigationGroup {
  if (workspaceEnvironmentIds.has(item.id)) return "Workspace";
  if (platformEnvironmentIds.has(item.id)) return "Platform";
  return "Governance";
}

interface WorkspaceOSNavigationProps {
  items: WorkspaceOSNavItem[];
  currentId: string;
  organizationName: string;
  workspaceName: string;
  projectName: string;
  workspaceHref: string;
}

function NavigationList({
  items,
  currentId,
  query,
  onNavigate,
}: {
  items: WorkspaceOSNavItem[];
  currentId: string;
  query: string;
  onNavigate?: () => void;
}) {
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      `${item.label} ${item.description} ${navigationGroupFor(item)}`.toLowerCase().includes(normalized),
    );
  }, [items, query]);

  const grouped = useMemo(() => navigationGroupOrder.map((group) => ({
    group,
    items: filtered.filter((item) => navigationGroupFor(item) === group),
  })).filter((entry) => entry.items.length > 0), [filtered]);

  return (
    <nav aria-label="Project environments" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
      <div className="space-y-4 pt-1">
        {grouped.map(({ group, items: groupItems }) => (
          <section key={group} aria-labelledby={`workspace-os-nav-${group.toLowerCase()}`}>
            <p
              id={`workspace-os-nav-${group.toLowerCase()}`}
              className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
            >
              {group}
            </p>
            <div className="space-y-1">
              {groupItems.map((item) => {
                const active = item.id === currentId;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                    className={cn(
                      "group flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
                      active
                        ? "border-cyan-300/30 bg-cyan-300 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,.12)]"
                        : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[.05] hover:text-white",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        active ? "bg-slate-950" : "bg-slate-600 group-hover:bg-cyan-300",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{item.label}</span>
                      <span className={cn("mt-0.5 block line-clamp-1 text-[11px]", active ? "text-slate-800" : "text-slate-500")}>
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight className={cn("h-4 w-4 shrink-0", active ? "text-slate-800" : "text-slate-600 group-hover:text-cyan-300")} />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
        {!filtered.length && (
          <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-500">
            No environment matches “{query}”.
          </p>
        )}
      </div>
    </nav>
  );
}

function SidebarContent({
  items,
  currentId,
  organizationName,
  workspaceName,
  projectName,
  workspaceHref,
  query,
  setQuery,
  onNavigate,
  searchRef,
}: WorkspaceOSNavigationProps & {
  query: string;
  setQuery: (value: string) => void;
  onNavigate?: () => void;
  searchRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <>
      <div className="border-b border-white/10 p-4">
        <Link
          href={workspaceHref}
          className="block rounded-xl border border-white/10 bg-white/[.025] p-3 transition hover:border-cyan-300/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Project workspace</p>
          <p className="mt-1 line-clamp-2 text-sm font-bold text-white">{projectName}</p>
          <p className="mt-1 truncate text-[11px] text-slate-500">{organizationName} · {workspaceName}</p>
        </Link>
        <label className="relative mt-3 block">
          <span className="sr-only">Search workspace environments</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find an environment"
            className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/80 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>
      </div>
      <NavigationList items={items} currentId={currentId} query={query} onNavigate={onNavigate} />
      <div className="border-t border-white/10 p-4 text-[11px] leading-5 text-slate-500">
        Membership and permissions remain authoritative. Hidden environments are not available to this account.
      </div>
    </>
  );
}

export function WorkspaceOSNavigation(props: WorkspaceOSNavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => searchRef.current?.focus(), 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(pendingFocusKey) === "true") {
        window.sessionStorage.removeItem(pendingFocusKey);
        window.requestAnimationFrame(() => document.getElementById("workspace-main-content")?.focus());
      }
    } catch {
      // Focus restoration remains a progressive enhancement when storage is unavailable.
    }
  }, [pathname]);

  function markRouteNavigation() {
    try {
      window.sessionStorage.setItem(pendingFocusKey, "true");
    } catch {
      // Navigation remains fully functional when storage is unavailable.
    }
  }

  const current = props.items.find((item) => item.id === props.currentId) ?? props.items[0];

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3 xl:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Workspace OS</p>
          <p className="truncate text-sm font-semibold text-white">{current?.label ?? "Project home"}</p>
        </div>
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls="workspace-os-mobile-drawer"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <Menu aria-hidden="true" className="h-4 w-4" />
          Menu
        </button>
      </div>

      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] min-h-[560px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/75 shadow-2xl backdrop-blur xl:flex">
        <SidebarContent {...props} query={query} setQuery={setQuery} onNavigate={markRouteNavigation} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-[80] xl:hidden">
          <button
            type="button"
            aria-label="Close workspace navigation"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            id="workspace-os-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Workspace navigation"
            className="absolute inset-y-0 left-0 flex w-[min(90vw,360px)] flex-col overflow-hidden border-r border-white/10 bg-slate-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">GEM Enterprise</p>
                <p className="text-sm font-bold text-white">Workspace OS</p>
              </div>
              <button
                type="button"
                aria-label="Close workspace navigation"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent
              {...props}
              query={query}
              setQuery={setQuery}
              onNavigate={() => {
                markRouteNavigation();
                setOpen(false);
              }}
              searchRef={searchRef}
            />
          </div>
        </div>
      )}
    </>
  );
}
