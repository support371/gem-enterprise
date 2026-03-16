interface SupportLauncherProps {
  onOpen: () => void;
}

export function SupportLauncher({ onOpen }: SupportLauncherProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-cyan-600 px-5 py-3 text-white shadow-lg hover:bg-cyan-500"
    >
      Talk to Concierge
    </button>
  );
}
