"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

const platformLinks = [
  { label: "Intel", path: "/intel" },
  { label: "Services", path: "/services" },
  { label: "Community", path: "/community-hub" },
  { label: "Hub", path: "/hub" },
  { label: "Resources", path: "/resources" },
];

const companyLinks = [
  { label: "About", path: "/about" },
  { label: "Leadership", path: "/company#leadership" },
  { label: "Contact", path: "/contact" },
  { label: "Compliance Notice", path: "/compliance-notice" },
];

const legalLinks = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Service", path: "/terms" },
  { label: "Compliance Notice", path: "/compliance-notice" },
  { label: "Cookie Policy", path: "/privacy#cookies" },
];

const accessLinks = [
  { label: "Client Login", path: "/client-login" },
  { label: "Eligibility Status", path: "/eligibility/status" },
  { label: "Get Started", path: "/get-started" },
  { label: "Contact", path: "/contact" },
];

export function GlobalFooter() {
  const { dictionary } = useI18n();
  const translate = (label: string) => dictionary.navigation.labels[label] ?? label;

  const columns = [
    { heading: dictionary.footer.platform, links: platformLinks },
    { heading: dictionary.footer.company, links: companyLinks },
    { heading: dictionary.footer.legal, links: legalLinks },
    { heading: dictionary.footer.clientAccess, links: accessLinks },
  ];

  return (
    <footer className="border-t border-white/[0.07] bg-[#0a1018]" aria-label="Site footer">
      <div className="mx-auto max-w-screen-xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/25">
                <Shield className="h-5 w-5 text-cyan-300" aria-hidden="true" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-widest text-cyan-300">GEM</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">Enterprise</span>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/45">{dictionary.footer.tagline}</p>
          </div>

          <div className="max-w-xs rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-300">
              {dictionary.footer.qualifiedClientsOnly}
            </p>
            <p className="text-xs leading-relaxed text-white/35">
              {dictionary.footer.qualifiedClientsDescription}
            </p>
          </div>
        </div>

        <div className="mb-12 h-px bg-white/[0.06]" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
                {column.heading}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.path}`}>
                    <Link href={link.path} className="text-sm text-white/50 transition-colors hover:text-cyan-300">
                      {translate(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-6 text-xs text-white/30">
          © {new Date().getFullYear()} GEM Enterprise. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
