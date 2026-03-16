import { SupportSession } from "@/services/support/types";
import { SupportTranscript } from "./SupportTranscript";
import { SupportActionRail } from "./SupportActionRail";

interface Props {
  open: boolean;
  session: SupportSession | null;
  loading: boolean;
  input: string;
  canSend: boolean;
  onClose: () => void;
  onReset: () => void;
  onStart: () => void;
  onConsent: () => void;
  onInput: (value: string) => void;
  onSend: () => void;
  onHuman: () => void;
  onTicket: () => void;
  onBooking: () => void;
}

export function SupportSessionShell({
  open,
  session,
  loading,
  input,
  canSend,
  onClose,
  onReset,
  onStart,
  onConsent,
  onInput,
  onSend,
  onHuman,
  onTicket,
  onBooking,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex h-[650px] w-[430px] flex-col rounded-2xl border border-slate-800 bg-slate-900 text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <div className="font-semibold">AI Concierge Support</div>
          <div className="text-xs text-slate-400">Secure in-portal assistance</div>
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="text-xs text-rose-400 hover:text-rose-300">Reset</button>
          <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
        </div>
      </div>

      {!session ? (
        <div className="space-y-4 p-4">
          <p className="text-sm text-slate-300">Start a support session from inside your portal workspace.</p>
          <button onClick={onStart} className="w-full rounded-lg bg-cyan-600 py-3 hover:bg-cyan-500">Start Support</button>
        </div>
      ) : !session.consented ? (
        <div className="space-y-4 p-4">
          <p className="text-sm text-slate-300">This assistant can help with support guidance and routing. Transcript retention is enabled for this session.</p>
          <button onClick={onConsent} className="w-full rounded-lg bg-cyan-600 py-3 hover:bg-cyan-500">Accept and Continue</button>
        </div>
      ) : (
        <>
          <SupportTranscript messages={session.messages} loading={loading} />
          <div className="space-y-3 border-t border-slate-800 p-3">
            <textarea
              value={input}
              onChange={(e) => onInput(e.target.value)}
              rows={3}
              placeholder="Describe what you need help with..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"
            />
            <button
              onClick={onSend}
              disabled={!canSend}
              className="w-full rounded-lg bg-cyan-600 py-3 hover:bg-cyan-500 disabled:opacity-60"
            >
              Send
            </button>
            <SupportActionRail onHuman={onHuman} onTicket={onTicket} onBooking={onBooking} disabled={loading} />
          </div>
        </>
      )}
    </div>
  );
}
