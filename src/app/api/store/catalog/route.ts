import { NextResponse } from "next/server";
import { commerceChannels, storeProducts } from "@/lib/storeCatalog";

export async function GET() {
  return NextResponse.json({
    ok: true,
    brand: "GEM Enterprise",
    store_url: "https://www.gemcybersecurityassist.com/store",
    architecture: "unified-commerce-hub",
    channels: commerceChannels.map((channel) => ({
      slug: channel.slug,
      name: channel.name,
      status: channel.status,
      summary: channel.summary,
      purpose: channel.purpose,
      owner_page: `https://www.gemcybersecurityassist.com${channel.ownerPage}`,
      canonical_url: channel.canonicalUrl ?? null,
      actions: channel.actions,
      agent_notes: channel.agentNotes,
    })),
    products: storeProducts.map((product) => ({
      slug: product.slug,
      name: product.name,
      category: product.category,
      description: product.shortDescription,
      full_description: product.description,
      delivery: product.delivery,
      onboarding: product.onboarding,
      price_label: product.priceLabel,
      commerce_channels: product.commerceChannels,
      integration_targets: product.integrationTargets.map(
        (target) => `https://www.gemcybersecurityassist.com${target}`,
      ),
      product_url: `https://www.gemcybersecurityassist.com/store/${product.slug}`,
      checkout_url: product.checkoutUrl ?? null,
      image_url: product.image,
      featured: Boolean(product.featured),
    })),
  });
}
