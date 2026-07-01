import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { storeCategories, storeProducts } from "@/lib/storeCatalog";

export const metadata: Metadata = {
  title: "GEM Security Store | Enterprise Cybersecurity Solutions",
  description:
    "Browse GEM Enterprise monitoring, security assessment, compliance readiness, and cybersecurity advisory solutions.",
};

const trustSignals = [
  { icon: ShieldCheck, title: "Security-first", text: "Structured services designed around operational risk." },
  { icon: LockKeyhole, title: "Controlled onboarding", text: "Scope and access are confirmed before delivery begins." },
  { icon: Headphones, title: "Human support", text: "GEM support remains available throughout the service lifecycle." },
];

export default function StorePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#07101c] py-24 md:py-32">
        <div className="absolute inset-0">
          <Image
            src="https://media.base44.com/images/public/69d42975b7b1794c3dc01661/b42c69a20_generated_image.png"
            alt="GEM Enterprise digital security network"
            fill
            priority
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07101c]/50 via-[#07101c]/80 to-[#07101c]" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-4xl">
            <Badge className="mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-300">
              <ShoppingBag className="mr-2 h-3.5 w-3.5" />
              GEM Security Store
            </Badge>
            <h1 className="text-5xl font-black leading-tight text-white md:text-7xl">
              Enterprise protection,
              <span className="block text-cyan-300">packaged for direct access.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
              Choose monitoring, assessment, compliance, and advisory solutions designed to strengthen your organization&apos;s security posture while keeping the customer journey inside the trusted GEM Enterprise website.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
                <Link href="#solutions">
                  Browse Solutions <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
                <Link href="/contact">Speak With an Advisor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.02] py-10">
        <div className="container mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-3">
          {trustSignals.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-black/10 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-white">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="solutions" className="container mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="mb-4 rounded-full border border-white/10 bg-white/5 text-slate-300">Store catalog</Badge>
            <h2 className="text-4xl font-black text-white md:text-5xl">Choose the right security solution</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
              Every offer includes a clear service scope, expected onboarding path, and a direct next step.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {storeCategories.map((category) => (
              <span key={category} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {storeProducts.map((product) => (
            <article key={product.slug} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] transition-all hover:border-cyan-400/40 hover:bg-white/[0.04]">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={product.image}
                  alt={`${product.name} by GEM Enterprise`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
                <div className="absolute left-5 top-5 flex gap-2">
                  <Badge className="rounded-full border border-cyan-500/30 bg-[#07101c]/80 text-cyan-300 backdrop-blur">
                    {product.category}
                  </Badge>
                  {product.featured && (
                    <Badge className="rounded-full border-0 bg-cyan-400 text-black">Featured</Badge>
                  )}
                </div>
              </div>

              <div className="p-7">
                <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                <p className="mt-4 min-h-16 leading-relaxed text-slate-400">{product.shortDescription}</p>

                <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <span>{product.delivery}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <span>{product.onboarding}</span>
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500">Access</div>
                    <div className="mt-1 font-semibold text-white">{product.priceLabel}</div>
                  </div>
                  <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                    <Link href={`/store/${product.slug}`}>
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <BadgeCheck className="mr-2 h-4 w-4" />
              Enterprise service model
            </Badge>
            <h2 className="text-4xl font-black text-white">A clear path from purchase to protection</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Standardized services can begin through the store, while customized or higher-complexity engagements move through a controlled scoping and onboarding process.
            </p>
          </div>
          <div className="grid gap-4">
            {["Select a GEM solution", "Review scope and service details", "Purchase or request a quote", "Complete secure onboarding", "Begin service delivery"].map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-xl border border-white/10 bg-background/60 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-sm font-black text-cyan-300">
                  {index + 1}
                </span>
                <span className="font-medium text-white">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-4xl font-black text-white">Need a tailored security engagement?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
          Tell GEM what you are protecting, what concerns you most, and the outcome you need. A specialist can help identify the right starting point.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full bg-cyan-400 px-9 font-semibold text-black hover:bg-cyan-300">
          <Link href="/contact">Request Enterprise Support</Link>
        </Button>
      </section>
    </main>
  );
}
