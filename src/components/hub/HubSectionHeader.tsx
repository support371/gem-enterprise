import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HubSectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  actions?: ReactNode;
  className?: string;
}

/**
 * Consistent section header used across the GEM Community Hub.
 * Keeps typography hierarchy and spacing tight and premium.
 */
export function HubSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  actions,
  className,
}: HubSectionHeaderProps) {
  const alignmentCls = align === "center" ? "items-center text-center" : "items-start";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        alignmentCls,
        className
      )}
    >
      {eyebrow && (
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/80">
          {eyebrow}
        </span>
      )}
      <div
        className={cn(
          "flex w-full flex-col gap-4 md:flex-row md:items-end md:justify-between",
          align === "center" && "md:flex-col md:items-center md:justify-center"
        )}
      >
        <div className={cn("flex flex-col gap-2", align === "center" && "items-center")}>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl text-balance">
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base text-pretty",
                align === "center" && "mx-auto"
              )}
            >
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
