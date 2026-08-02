import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  ExternalLink,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPublicDirectory,
  type PublicDirectoryProfile,
} from "@/lib/notion-public-directory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verified Personnel Directory | GEM Enterprise",
  description:
    "Publication-controlled directory of GEM personnel and approved professional profiles.",
  alternates: { canonical: "/personnel" },
};

function ProfileCard({ profile }: { profile: PublicDirectoryProfile }) {
  const floridaLicense =
    profile.licenseJurisdiction?.toLowerCase().includes("florida") ?? false;

  return (
    <Card className="border-white/10 bg-white/[0.04]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-white">{profile.name}</p>
            {profile.role && <p className="mt-1 text-sm text-slate-300">{profile.role}</p>}
          </div>
          <Badge className="border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
            <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
            Publication approved
          </Badge>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          {profile.profileType && (
            <Badge variant="outline" className="border-white/15 text-slate-300">
              {profile.profileType}
            </Badge>
          )}
          {profile.division && (
            <Badge variant="outline" className="border-cyan-400/20 text-cyan-200">
              {profile.division}
            </Badge>
          )}
          {profile.verificationStatus && (
            <Badge variant="outline" className="border-white/15 text-slate-300">
              Review: {profile.verificationStatus}
            </Badge>
          )}
        </div>

        {profile.bio && <p className="mt-5 text-sm leading-7 text-slate-300">{profile.bio}</p>}

        {(profile.licenseType ||
          profile.licenseAuthority ||
          profile.licenseJurisdiction) && (
          <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Public license verification
            </div>
            <dl className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-3">
              {profile.licenseType && (
                <div>
                  <dt className="text-slate-500">Type</dt>
                  <dd className="mt-0.5">{profile.licenseType}</dd>
                </div>
              )}
              {profile.licenseAuthority && (
                <div>
                  <dt className="text-slate-500">Authority</dt>
                  <dd className="mt-0.5">{profile.licenseAuthority}</dd>
                </div>
              )}
              {profile.licenseJurisdiction && (
                <div>
                  <dt className="text-slate-500">Jurisdiction</dt>
                  <dd className="mt-0.5">{profile.licenseJurisdiction}</dd>
                </div>
              )}
            </dl>
            {floridaLicense && (
              <Link
                href="https://www.myfloridalicense.com/wl11.asp?SID=&mode=0"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-200 underline decoration-emerald-400/40 underline-offset-4 hover:text-white"
              >
                Verify with Florida DBPR
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function PersonnelPage() {
  const directory = await getPublicDirectory();
  const hasProfiles = directory.status === "ready" && directory.profiles.length > 0;

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <section className="border-b border-white/10 bg-[#041326]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Approval-gated directory
            </Badge>
            <Badge variant="outline" className="border-white/15 text-slate-300">
              No demo profiles
            </Badge>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Verified people and professional teams
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            This page publishes only records that have completed evidence review and received
            explicit website approval. Private sessions, VIP governance records, evidence files,
            internal notes, and license numbers are never displayed here.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {hasProfiles ? (
          <>
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Published directory</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {directory.profiles.length} human-approved public{" "}
                  {directory.profiles.length === 1 ? "profile" : "profiles"}
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-emerald-300" aria-hidden="true" />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {directory.profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.06] p-8 sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-200">
              {directory.status === "provider_error" ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
            <h2 className="mt-5 text-2xl font-semibold">
              {directory.status === "not_configured"
                ? "Directory publication is not configured"
                : directory.status === "provider_error"
                  ? "Directory is temporarily unavailable"
                  : "No profiles are approved for public publication"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              GEM does not substitute sample people or generated credentials when verified public
              records are unavailable. An authorized reviewer must verify evidence and approve each
              record before it can appear on this page.
            </p>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-slate-400">
          Publication approval confirms that a record may appear on this website; it does not
          replace verification by the issuing authority. For regulated work, confirm the
          professional&apos;s current standing directly with the relevant public registry.
        </div>
      </section>
    </main>
  );
}
