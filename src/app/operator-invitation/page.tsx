import OperatorInvitationAcceptClient from "@/components/auth/OperatorInvitationAcceptClient";

export const metadata = {
  title: "Operator Invitation | GEM Enterprise",
  description: "Complete a protected, one-time GEM Verify operator invitation.",
  robots: { index: false, follow: false },
};

export default function OperatorInvitationPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          GEM Enterprise
        </p>
      </div>
      <OperatorInvitationAcceptClient />
    </main>
  );
}
