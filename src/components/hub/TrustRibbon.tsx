import { ShieldCheck, Fingerprint, ScrollText, Globe2 } from "lucide-react";
import { TRUST_PILLARS } from "@/lib/hub/mock-data";

const ICON_MAP = [ShieldCheck, Fingerprint, ScrollText, Globe2] as const;

/**
 * Private-network trust signalling strip.
 * Four pillars: Private · Verified · Compliance-aware · Cross-border.
 */
export function TrustRibbon() {
  return (
    <div
      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-1.5"
      aria-label="GEM Community Hub trust pillars"
    >
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/[0.04] md:grid-cols-4">
        {TRUST_PILLARS.map((pillar, i) => {
          const Icon = ICON_MAP[i] ?? ShieldCheck;
          return (
            <div
              key={pillar.label}
              className="flex flex-col items-start gap-2 bg-[#0e1420] px-5 py-5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {pillar.label}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {pillar.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
