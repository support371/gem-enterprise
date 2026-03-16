import { SupportMessage } from "@/services/support/types";

export function SupportTranscript({ messages, loading }: { messages: SupportMessage[]; loading: boolean }) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.length === 0 ? <div className="rounded-lg bg-slate-950 p-4 text-sm text-slate-400">Describe what you need help with.</div> : null}
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.actor === "user"
              ? "ml-auto max-w-[85%] rounded-lg bg-cyan-700 px-4 py-3 text-white"
              : message.actor === "system"
              ? "mx-auto max-w-[92%] rounded-lg bg-slate-700 px-4 py-3 text-slate-100"
              : "mr-auto max-w-[85%] rounded-lg bg-slate-800 px-4 py-3 text-slate-100"
          }
        >
          <div className="mb-1 text-xs opacity-70">{message.actor}</div>
          <div>{message.content}</div>
        </div>
      ))}
      {loading ? <div className="mr-auto max-w-[85%] rounded-lg bg-slate-800 px-4 py-3 text-slate-300">Assistant is responding…</div> : null}
    </div>
  );
}
