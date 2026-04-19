import { ShieldCheck, Clock, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/lib/hub/mock-data";

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Discrete, enterprise-grade verification marker.
 * No neon or glow — used in tight card and row contexts.
 */
export function VerificationBadge({
  status,
  size = "sm",
  className,
}: VerificationBadgeProps) {
  const Icon =
    status === "Verified" ? ShieldCheck : status === "Pending" ? Clock : Archive;

  const tone =
    status === "Verified"
      ? "border-primary/25 bg-primary/8 text-primary"
      : status === "Pending"
      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
      : "border-white/10 bg-white/5 text-white/50";

  const sizeCls =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 gap-1"
      : "text-xs px-2.5 py-1 gap-1.5";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium uppercase tracking-wider",
        tone,
        sizeCls,
        className
      )}
      aria-label={`${status} member`}
    >
      <Icon className={iconSize} aria-hidden="true" />
      {status}
    </span>
  );
}
