import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { commerceChannels, getCommerceChannel, storeProducts } from "@/lib/storeCatalog";

type ChannelPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return commerceChannels.map((channel) => ({ slug: channel.slug }));
}

export async function generateMetadata({ params }: ChannelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const channel = getCommerceChannel(slug);

  if (!channel) {
    return { title: "Store Channel Not Found | GEM Enterprise" };
  }

  return {
    title: `${channel.name} | GEM Store Channel`,
    description: channel.summary,
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { slug } = await params;
  const channel = getCommerceChannel(slug);

  if (!channel) notFound();

  const mappedProducts = storeProducts.filter((product) =>
    product.channelAvailability.some((item) => item.channelSlug === channel.slug),
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-white/10 bg-[#07101c]">
        <div className="container mx-auto max-w-7xl px-6 py-7">
          <Link
            href="/store#commerce-channels"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store Channels
          </Link>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#07101c] py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <Badge className="mb-5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <ShoppingBag className="mr-2 h-4 w-4" /> {channel.status}
            </Badge>
            <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">{channel.name}</h1>
            <p className="mt-6 max-w-4xl text-xl leading-relaxed text-slate-300">{channel.summary}</p>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-slate-400">{channel.purpose}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              {channel.slug === "shopify-store" ? (
                <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
                  <Link href="/store/shopify">
                    Open Shopify Store <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
                  <Link href="/store#solutions">
                    Browse Mapped Products <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
              {channel.canonicalUrl && (
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 px-8 text-white hover:bg-white/10">
                  <a href={channel.canonicalUrl} target="_blank" rel="noreferrer">
                    Open Connected Destination <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Current channel status</div>
            <p className="mt-3 text-lg leading-relaxed text-white">{channel.statusDetails}</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-widest text-slate-500">Mapped products</div>
              <div className="mt-2 text-3xl font-black text-white">{mappedProducts.length}</div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.02] py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black text-white">What this channel handles</h2>
            <div className="mt-7 grid gap-4">
              {channel.actions.map((action) => (
                <div key={action} className="flex items-start gap-3 rounded-xl border border-white/10 bg-background/50 p-4 text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">Connection checklist</h2>
            <div className="mt-7 grid gap-4">
              {channel.setupChecklist.map((item, index) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-background/50 p-4 text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-300">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10">
          <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <PackageSearch className="mr-2 h-4 w-4" /> Product mapping
          </Badge>
          <h2 className="text-4xl font-black text-white">Products connected to this channel</h2>
        </div>

        {mappedProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {mappedProducts.map((product) => {
              const availability = product.channelAvailability.find(
                (item) => item.channelSlug === channel.slug,
              );

              return (
                <article key={product.slug} className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                      {availability?.status ?? channel.status}
                    </Badge>
                    <Badge className="rounded-full border border-white/10 bg-white/5 text-slate-300">
                      {product.category}
                    </Badge>
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-white">{product.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{product.shortDescription}</p>
                  {availability?.note && (
                    <p className="mt-4 text-sm leading-relaxed text-slate-300">{availability.note}</p>
                  )}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
                      <Link href={`/store/${product.slug}`}>View Product</Link>
                    </Button>
                    {product.checkoutUrl && channel.slug === "shopify-store" && (
                      <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <a href={product.checkoutUrl} target="_blank" rel="noreferrer">
                          Checkout <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <h3 className="text-2xl font-bold text-white">No public products mapped yet</h3>
            <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-slate-400">
              The channel structure is ready. Product IDs, approved destinations, and synchronization credentials are still required before public product routing can be activated.
            </p>
            <Button asChild className="mt-6 bg-cyan-400 font-semibold text-black hover:bg-cyan-300">
              <Link href="/contact">Contact GEM Support</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
