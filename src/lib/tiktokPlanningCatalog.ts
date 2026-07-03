import planningRows from "@/data/tiktokPlanningProducts.json";
import type { StorefrontProduct } from "@/lib/storefrontCatalog";

type PlanningRow = [string, number, number, string, string, number, string];

const categoryMap: Record<string, string> = {
  "Home & Office > Stationery & Gift Sets": "Client Gifts",
  "Office Supplies > Filing & Organization": "Office Essentials",
  "Office Supplies > Desk Accessories": "Office Essentials",
  "Home Supplies > Moving & Storage": "Home Organization",
  "Home Decor > Decorative Accessories": "Home Decor",
  "Event Supplies > Presentation & Signage": "Event Supplies",
  "Home Improvement > Safety & Security": "Home Safety",
  "Home Supplies > Organization": "Home Organization",
  "Gift Wrap & Accessories": "Client Gifts",
  "Apparel & Accessories > Lifestyle Accessories": "Lifestyle"
};

const accents: StorefrontProduct["accent"][] = ["cyan", "green", "purple", "orange", "pink"];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const tiktokPlanningProducts: StorefrontProduct[] = (planningRows as PlanningRow[]).map(
  ([name, price, plannedQuantity, sku, sourceCategory, weightGrams, dimensions], index) => ({
    id: `tiktok-${slugify(name)}`,
    sku,
    name,
    shortDescription: `Draft TikTok Shop item. Planned quantity: ${plannedQuantity}. Weight: ${weightGrams} g. Dimensions: ${dimensions}. Images, product identifiers, inventory, eligibility, and final approval still require verification.`,
    category: categoryMap[sourceCategory] || sourceCategory,
    price,
    deliveryType: "Physical",
    stockLabel: "Request access",
    storefronts: ["tiktok"],
    accent: accents[index % accents.length]
  })
);

export const tiktokPlanningCategories = [
  "All",
  ...Array.from(new Set(tiktokPlanningProducts.map((product) => product.category)))
];
