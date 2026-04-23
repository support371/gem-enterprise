export default function AppLoading() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-[hsl(var(--svc-cyber))] border-t-transparent animate-spin" />
        <p className="text-xs font-mono tracking-widest text-slate-500">Loading…</p>
      </div>
    </div>
  );
}
