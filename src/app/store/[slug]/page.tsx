import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStoreProduct, storeProducts } from "@/lib/storeCatalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return storeProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getStoreProduct(slug);

  if (!product) {
    return { title: "Store Solution Not Found | GEM Enterprise" };
  }

  return {
    title: `${product.name} | GEM Security Store`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getStoreProduct(slug);

  if (!product) notFound();

  const contactHref = `/contact?service=${encodeURIComponent(product.slug)}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-white/10 bg-[#07101c]">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <Link href="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" /> Back to GEM Security Store
          </Link>
        </div>
      </section>

      <section className="container mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge className="rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">{product.category}</Badge>
            {product.featured && <Badge className="rounded-full border-0 bg-cyan-400 text-black">Featured solution</Badge>}
          </div>
          <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">{product.name}</h1>
          <p className="mt-6 text-xl leading-relaxed text-slate-300">{product.description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-500">
                <ShieldCheck className="h-4 w-4 text-cyan-400" /> Delivery
              </div>
              <div className="mt-3 font-semibold text-white">{product.delivery}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-500">
                <Clock3 className="h-4 w-4 text-cyan-400" /> Onboarding
              </div>
              <div className="mt-3 font-semibold text-white">{product.onboarding}</div>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            {product.checkoutUrl ? (
              <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
                <a href={product.checkoutUrl} target="_blank" rel="noreferrer">
                  Continue to Secure Checkout <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
            ) : (
              <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
                <Link href={contactHref}>
                  Request This Service <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
              <Link href="/contact">Speak With an Advisor</Link>
            </Button>
          </div>

          <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
            Final scope, access requirements, and delivery terms are confirmed during secure onboarding.
          </p>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-cyan-500/20 bg-white/[0.03] shadow-2xl shadow-cyan-950/30">
          <Image src={product.image} alt={`${product.name} from GEM Enterprise`} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07101c] via-[#07101c]/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7">
            <div className="rounded-2xl border border-white/10 bg-[#07101c]/80 p-5 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Service access</div>
              <div className="mt-2 text-lg font-bold text-white">{product.priceLabel}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-20">
        <div className="container mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
          <div>
            <Badge className="mb-4 rounded-full border border-white/10 bg-white/5 text-slate-300">
              <Sparkles className="mr-2 h-4 w-4 text-cyan-300" /> What is included
            </Badge>
            <h2 className="text-3xl font-black text-white">A structured, clearly defined engagement</h2>
            <div className="mt-7 grid gap-4">
              {product.includes.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-background/50 p-4 text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Badge className="mb-4 rounded-full border border-white/10 bg-white/5 text-slate-300">Designed for</Badge>
            <h2 className="text-3xl font-black text-white">Organizations seeking practical protection</h2>
            <div className="mt-7 grid gap-4">
              {product.suitableFor.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-background/50 p-4 text-slate-300">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-4xl font-black text-white">Ready to strengthen your security posture?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
          Start with this solution or speak with GEM to confirm the best service path for your organization.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          {product.checkoutUrl ? (
            <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
              <a href={product.checkoutUrl} target="_blank" rel="noreferrer">
                Open Shopify Checkout <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </Button>
          ) : (
            <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
              <Link href={contactHref}>Request This Service</Link>
            </Button>
          )}
          <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
            <Link href="/store">Browse Other Solutions</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
