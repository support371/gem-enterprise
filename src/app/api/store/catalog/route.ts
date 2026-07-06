import { NextResponse } from "next/server";
import { commerceChannels, storeProducts } from "@/lib/storeCatalog";
import { storefrontDefinitions, storefrontProducts } from "@/lib/storefrontCatalog";
import { TIKTOK_MAIN_STORE_URL } from "@/lib/storefrontDestinations";
import { tiktokPlanningProducts } from "@/lib/tiktokPlanningCatalog";

const origin = "https://www.gemcybersecurityassist.com";

export async function GET() {
  return NextResponse.json({
    ok: true,
    brand: "GEM Enterprise",
    store_url: `${origin}/store`,
    architecture: "parent-store-with-dedicated-subpages",
    storefronts: storefrontDefinitions.map((storefront) => ({
      ...storefront,
      page_url: `${origin}/store/${storefront.slug}`,
      external_url:
        storefront.slug === "tiktok"
          ? TIKTOK_MAIN_STORE_URL
          : storefront.externalUrl ?? null,
      external_label:
        storefront.slug === "tiktok"
          ? "Open Main TikTok Shop"
          : storefront.externalLabel ?? null,
      product_count:
        storefront.slug === "tiktok"
          ? tiktokPlanningProducts.length
          : storefrontProducts.filter((product) => product.storefronts.includes(storefront.slug)).length,
    })),
    marketplace_products: storefrontProducts.map((product) => ({
      ...product,
      store_pages: product.storefronts.map((storefront) => `${origin}/store/${storefront}`),
      checkout_url: product.checkoutUrl ?? null,
      inquiry_url: `${origin}/contact?product=${encodeURIComponent(product.name)}`,
    })),
    tiktok_planning_catalog: {
      status: "draft-validation-required",
      source_rows: tiktokPlanningProducts.length,
      store_url: `${origin}/store/tiktok`,
      external_store_url: TIKTOK_MAIN_STORE_URL,
      required_before_upload: [
        "real product images",
        "GTIN/UPC or approved exemption",
        "verified physical inventory",
        "category eligibility",
        "shipping package data",
        "TikTok Seller Center approval"
      ],
      products: tiktokPlanningProducts.map((product) => ({
        ...product,
        inquiry_url: `${origin}/contact?store=tiktok&product=${encodeURIComponent(product.name)}`,
      })),
    },
    service_channels: commerceChannels.map((channel) => ({
      slug: channel.slug,
      name: channel.name,
      status: channel.status,
      summary: channel.summary,
      purpose: channel.purpose,
      owner_page: `${origin}${channel.ownerPage}`,
      channel_page: `${origin}${channel.channelPage}`,
      canonical_url: channel.canonicalUrl ?? null,
      public_cta_label: channel.publicCtaLabel,
      status_details: channel.statusDetails,
      setup_checklist: channel.setupChecklist,
      actions: channel.actions,
      agent_notes: channel.agentNotes,
    })),
    service_products: storeProducts.map((product) => ({
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
        actionUrl: item.actionUrl.startsWith("http") ? item.actionUrl : `${origin}${item.actionUrl}`,
      })),
      integration_targets: product.integrationTargets.map((target) => `${origin}${target}`),
      product_url: `${origin}/store/${product.slug}`,
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
