"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Search, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserRecord {
  id: string;
  email: string;
  role: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    entityType: string | null;
  } | null;
}

const statusColor: Record<string, string> = {
  active: "bg-green-500/15 text-green-400 border-green-500/25",
  suspended: "bg-red-500/15 text-red-400 border-red-500/25",
  pending_approval: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
};

const roleColor: Record<string, string> = {
  client: "text-slate-300",
  analyst: "text-blue-400",
  admin: "text-cyan-400",
  super_admin: "text-purple-400",
  internal: "text-violet-400",
};

function displayName(user: UserRecord) {
  if (user.profile?.firstName || user.profile?.lastName) {
    return [user.profile.firstName, user.profile.lastName].filter(Boolean).join(" ");
  }

  return user.email;
}

function formatLabel(value?: string | null) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (Array.isArray(data.users)) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return users.filter((user) => displayName(user).toLowerCase().includes(normalized) || user.email.toLowerCase().includes(normalized));
  }, [query, users]);

  const summary = useMemo(() => ({
    total: users.length,
    active: users.filter((user) => user.isActive).length,
    suspended: users.filter((user) => !user.isActive).length,
    admins: users.filter((user) => user.role === "admin" || user.role === "super_admin").length,
  }), [users]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/app/admin">
            <Button variant="ghost" size="icon" className="mt-1 h-8 w-8 text-slate-400 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan-400">
              <Users className="h-3.5 w-3.5" /> User Governance
            </div>
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Review account status, role assignments, entity type, and access posture. Role/status changes should be handled through explicit admin actions.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="border-green-500/25 bg-green-500/15 text-green-400"><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Review Mode</Badge>
          <Button asChild size="sm" className="bg-cyan-400 text-black hover:bg-cyan-300">
            <Link href="/app/admin/audit"><UserPlus className="mr-2 h-4 w-4" /> Audit Trail</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total", value: summary.total, color: "text-white" },
          { label: "Active", value: summary.active, color: "text-green-400" },
          { label: "Suspended", value: summary.suspended, color: "text-red-400" },
          { label: "Admins", value: summary.admins, color: "text-cyan-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-panel bento-card rounded-xl p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${color}`}>{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email…"
          className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
        </div>
      ) : (
        <div className="glass-panel overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["User", "Role", "Status", "Entity Type", "Joined", "Review"].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, index) => (
                  <tr key={user.id} className={`border-b border-white/5 transition-colors hover:bg-white/5 ${index % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{displayName(user)}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${roleColor[user.role] ?? "text-slate-300"}`}>{formatLabel(user.role)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${statusColor[user.status] ?? "bg-slate-500/20 text-slate-400"} text-xs`}>{formatLabel(user.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-slate-400">{formatLabel(user.profile?.entityType)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="sm" className="border-white/10 text-xs text-slate-300 hover:bg-white/10 hover:text-white">
                        <Link href={`/app/admin/audit?user=${user.id}`}>Audit</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
