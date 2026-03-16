import { useEffect, useMemo, useState } from "react";
import { PlatformUser } from "@/lib/platform";
import { SupportSession } from "@/services/support/types";
import { clearSession, loadSessionFromStorage } from "@/services/support/store";
import { postRoute, supportApiRoutes } from "@/services/support/routes";
import { SupportLauncher } from "./SupportLauncher";
import { SupportSessionShell } from "./SupportSessionShell";

export function PortalSupportEntry({ user }: { user: PlatformUser }) {
  const [supportOpen, setSupportOpen] = useState(false);
  const [session, setSession] = useState<SupportSession | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = loadSessionFromStorage(user.id);
    if (existing) setSession(existing);
  }, [user.id]);

  const canSend = useMemo(() => Boolean(session?.consented && input.trim() && !loading), [session, input, loading]);

  async function startSupport() {
    const response = await postRoute(supportApiRoutes.start, {}, user);
    setSession(response.session);
    setSupportOpen(true);
  }

  async function acceptConsent() {
    if (!session) return;
    const response = await postRoute(supportApiRoutes.consent, { sessionId: session.id }, user);
    setSession(response.session);
  }

  async function sendMessage() {
    if (!session || !input.trim()) return;
    setLoading(true);
    const content = input.trim();
    setInput("");
    const response = await postRoute(supportApiRoutes.message, { sessionId: session.id, content }, user);
    setSession(response.session);
    setLoading(false);
  }

  async function requestHuman() {
    if (!session) return;
    const response = await postRoute(supportApiRoutes.escalate, { sessionId: session.id }, user);
    setSession(response.session);
  }

  async function createTicket() {
    if (!session) return;
    const response = await postRoute(supportApiRoutes.ticket, { sessionId: session.id }, user);
    setSession(response.session);
  }

  async function bookHelp() {
    if (!session) return;
    const response = await postRoute(supportApiRoutes.booking, { sessionId: session.id }, user);
    setSession(response.session);
  }

  function resetSupport() {
    clearSession(user.id);
    setSession(null);
    setInput("");
    setLoading(false);
    setSupportOpen(false);
  }

  return (
    <>
      <SupportLauncher onOpen={() => (session ? setSupportOpen(true) : startSupport())} />
      <SupportSessionShell
        open={supportOpen}
        session={session}
        loading={loading}
        input={input}
        canSend={canSend}
        onClose={() => setSupportOpen(false)}
        onReset={resetSupport}
        onStart={startSupport}
        onConsent={acceptConsent}
        onInput={setInput}
        onSend={sendMessage}
        onHuman={requestHuman}
        onTicket={createTicket}
        onBooking={bookHelp}
      />
    </>
  );
}
