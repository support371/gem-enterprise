import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { storeProducts } from "@/lib/storeCatalog";

export function HomeStoreShowcase() {
  const featuredProducts = storeProducts.slice(0, 3);

  return (
    <section className="relative overflow-hidden border-y border-cyan-500/10 bg-[#08111d] py-24">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs uppercase tracking-widest text-cyan-300">
              <ShoppingBag className="mr-2 h-3.5 w-3.5" />
              GEM Security Store
            </Badge>
            <h2 className="text-4xl font-black text-white md:text-5xl">
              Protection you can activate today
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
              Explore monitoring, assessment, compliance, and advisory solutions presented inside the trusted GEM Enterprise experience.
            </p>
          </div>

          <Button asChild size="lg" className="rounded-full bg-cyan-400 px-8 font-semibold text-black hover:bg-cyan-300">
            <Link href="/store">
              Explore the Store <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-7 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/store/${product.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition-all hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/[0.045]"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={product.image}
                  alt={`${product.name} from GEM Enterprise`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08111d] via-[#08111d]/30 to-transparent" />
                <Badge className="absolute left-4 top-4 rounded-full border border-cyan-500/30 bg-[#08111d]/80 text-cyan-300 backdrop-blur">
                  {product.category}
                </Badge>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white transition-colors group-hover:text-cyan-300">
                  {product.name}
                </h3>
                <p className="mt-3 min-h-20 text-sm leading-relaxed text-slate-400">
                  {product.shortDescription}
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  {product.delivery}
                </div>
                <div className="mt-6 flex items-center font-semibold text-cyan-300">
                  View solution <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
