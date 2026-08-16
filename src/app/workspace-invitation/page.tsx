import WorkspaceOwnerInvitationAcceptClient from "@/components/auth/WorkspaceOwnerInvitationAcceptClient";

export const metadata = {
  title: "Organization Workspace Invitation | GEM Enterprise",
  description: "Activate a protected GEM Enterprise organization-owner workspace.",
  robots: { index: false, follow: false },
};

export default function WorkspaceInvitationPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">GEM Enterprise</p>
      </div>
      <WorkspaceOwnerInvitationAcceptClient />
    </main>
  );
}
