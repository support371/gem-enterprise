import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9" disabled aria-label="Theme control loading">
        <span className="sr-only">Theme control loading</span>
      </Button>
    );
  }

  const dark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="w-9 h-9 relative overflow-hidden"
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      aria-pressed={dark}
      title={`Switch to ${dark ? "light" : "dark"} mode`}
    >
      <Sun className={`h-4 w-4 transition-all duration-300 ${dark ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`} aria-hidden="true" />
      <Moon className={`absolute h-4 w-4 transition-all duration-300 ${dark ? "rotate-90 scale-0" : "rotate-0 scale-100"}`} aria-hidden="true" />
      <span className="sr-only">{dark ? "Dark theme active" : "Light theme active"}</span>
    </Button>
  );
}
