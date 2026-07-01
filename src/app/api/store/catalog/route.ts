import { NextResponse } from "next/server";
import { storeProducts } from "@/lib/storeCatalog";

export async function GET() {
  return NextResponse.json({
    ok: true,
    brand: "GEM Enterprise",
    store_url: "https://www.gemcybersecurityassist.com/store",
    products: storeProducts.map((product) => ({
      slug: product.slug,
      name: product.name,
      category: product.category,
      description: product.shortDescription,
      delivery: product.delivery,
      onboarding: product.onboarding,
      product_url: `https://www.gemcybersecurityassist.com/store/${product.slug}`,
      image_url: product.image,
      featured: Boolean(product.featured),
    })),
  });
}
