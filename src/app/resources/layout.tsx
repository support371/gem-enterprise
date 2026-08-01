import Link from "next/link";
import { ArrowRight, Mail, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <aside className="border-b border-[#FFBF00]/25 bg-[#FFBF00]/[0.07] px-4 py-4 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:px-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl border border-[#FFBF00]/25 bg-[#FFBF00]/10 p-2">
              <Newspaper className="h-5 w-5 text-[#FFBF00]" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-[#ffe6a0]">The live GEM news channel is News Forge.</p>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-white/60">
                Use News Forge for the connected feed, story pages, saved items, preferences,
                authentication, and editorial workflow. Any article cards elsewhere in Resources
                are reference or archive content and are not the live channel.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#FFBF00] font-semibold text-[#001F3F] hover:bg-[#ffd04d]">
              <Link href="/intel/news">
                Open News Forge <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <Link href="/newsletter">
                <Mail className="mr-2 h-4 w-4" /> Newsletter
              </Link>
            </Button>
          </div>
        </div>
      </aside>
      {children}
    </>
  );
}
