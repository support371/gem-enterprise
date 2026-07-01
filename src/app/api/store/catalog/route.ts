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
      channel_page: `https://www.gemcybersecurityassist.com${channel.channelPage}`,
      canonical_url: channel.canonicalUrl ?? null,
      public_cta_label: channel.publicCtaLabel,
      status_details: channel.statusDetails,
      setup_checklist: channel.setupChecklist,
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
      purchase_mode: product.purchaseMode,
      primary_cta_label: product.primaryCtaLabel,
      commerce_channels: product.commerceChannels,
      channel_availability: product.channelAvailability.map((item) => ({
        ...item,
        actionUrl: item.actionUrl.startsWith("http")
          ? item.actionUrl
          : `https://www.gemcybersecurityassist.com${item.actionUrl}`,
      })),
      integration_targets: product.integrationTargets.map(
        (target) => `https://www.gemcybersecurityassist.com${target}`,
      ),
      product_url: `https://www.gemcybersecurityassist.com/store/${product.slug}`,
      checkout_url: product.checkoutUrl ?? null,
      image_url: product.image,
      featured: Boolean(product.featured),
      outcomes: product.outcomes,
      process_steps: product.processSteps,
      includes: product.includes,
      suitable_for: product.suitableFor,
      faqs: product.faqs,
      compliance_note: product.complianceNote,
    })),
  });
}
