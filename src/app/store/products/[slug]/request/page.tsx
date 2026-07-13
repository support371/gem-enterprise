import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileQuestion, LockKeyhole, ShieldCheck } from "lucide-react";
import { PublicIntakeForm } from "@/components/intake/PublicIntakeForm";
import { getStoreProduct, storeProducts } from "@/lib/storeCatalog";

type ProductRequestPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return storeProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductRequestPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getStoreProduct(slug);
  if (!product) return { title: "Catalogue Item Not Found" };
  return {
    title: `Request ${product.name}`,
    description: `Submit a non-binding request for ${product.name}.`,
  };
}

export default async function ProductRequestPage({ params }: ProductRequestPageProps) {
  const { slug } = await params;
  const product = getStoreProduct(slug);
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 px-6 py-16 cyber-grid">
        <div className="mx-auto max-w-5xl">
          <Link href={`/store/${product.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to catalogue item
          </Link>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <FileQuestion className="h-4 w-4" aria-hidden="true" /> Product request
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">{product.name}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            Submit the intended use, quantity, jurisdiction, and requirements. Product context is
            preserved in a dedicated product-request queue for human pricing and fulfillment review.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 py-12 md:grid-cols-2">
        <article className="rounded-2xl border border-border/70 bg-card/70 p-6">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-semibold">Request-only workflow</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Submission does not confirm availability, price, provider coverage, licensing,
            fulfillment, refund terms, delivery timing, or activation.
          </p>
        </article>
        <article className="rounded-2xl border border-border/70 bg-card/70 p-6">
          <LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-semibold">No payment or sensitive data</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This form does not collect payment-card details, banking information, identity
            documents, passwords, private keys, or confidential client records.
          </p>
        </article>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 sm:p-8">
          <PublicIntakeForm
            kind="PRODUCT_REQUEST"
            product={{ slug: product.slug, name: product.name, category: product.category }}
          />
        </div>
      </section>
    </main>
  );
}
