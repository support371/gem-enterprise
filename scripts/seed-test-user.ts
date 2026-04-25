/**
 * Seed script to create test users for E2E testing
 * Run with: pnpm tsx scripts/seed-test-user.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("[seed] Starting seed script...");

  // Test client user (KYC approved)
  const clientPassword = await bcrypt.hash("TestClient123!", 10);
  const client = await prisma.user.upsert({
    where: { email: "client@gem-enterprise.test" },
    update: {},
    create: {
      email: "client@gem-enterprise.test",
      passwordHash: clientPassword,
      role: "client",
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Test",
          lastName: "Client",
          displayName: "Test Client",
          entityType: "individual",
        },
      },
      kycApplications: {
        create: {
          entityType: "individual",
          status: "approved",
          submittedAt: new Date(),
          completedAt: new Date(),
        },
      },
      entitlements: {
        create: [
          { slug: "cyber", grantedBy: "system" },
          { slug: "financial", grantedBy: "system" },
        ],
      },
    },
    include: { profile: true, kycApplications: true },
  });
  console.log("[seed] Created/updated test client:", client.email);

  // Test admin user
  const adminPassword = await bcrypt.hash("TestAdmin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gem-enterprise.test" },
    update: {},
    create: {
      email: "admin@gem-enterprise.test",
      passwordHash: adminPassword,
      role: "admin",
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Admin",
          lastName: "User",
          displayName: "Admin",
          entityType: "individual",
        },
      },
      kycApplications: {
        create: {
          entityType: "individual",
          status: "approved",
          submittedAt: new Date(),
          completedAt: new Date(),
        },
      },
    },
    include: { profile: true },
  });
  console.log("[seed] Created/updated test admin:", admin.email);

  // Test user with pending KYC
  const pendingPassword = await bcrypt.hash("TestPending123!", 10);
  const pending = await prisma.user.upsert({
    where: { email: "pending@gem-enterprise.test" },
    update: {},
    create: {
      email: "pending@gem-enterprise.test",
      passwordHash: pendingPassword,
      role: "client",
      isActive: true,
      profile: {
        create: {
          firstName: "Pending",
          lastName: "User",
          displayName: "Pending User",
          entityType: "individual",
        },
      },
      kycApplications: {
        create: {
          entityType: "individual",
          status: "under_review",
          submittedAt: new Date(),
        },
      },
    },
    include: { profile: true },
  });
  console.log("[seed] Created/updated pending user:", pending.email);

  // Create a test portfolio
  const portfolio = await prisma.portfolio.upsert({
    where: { id: "test-portfolio-001" },
    update: {},
    create: {
      id: "test-portfolio-001",
      name: "Test Cyber Portfolio",
      description: "A test portfolio for E2E testing",
      category: "cyber",
      totalValue: 1500000,
      currency: "USD",
    },
  });
  console.log("[seed] Created/updated test portfolio:", portfolio.name);

  // Assign portfolio to client
  await prisma.portfolioMembership.upsert({
    where: {
      portfolioId_userId: {
        portfolioId: portfolio.id,
        userId: client.id,
      },
    },
    update: {},
    create: {
      portfolioId: portfolio.id,
      userId: client.id,
      role: "owner",
      assignedBy: "system",
    },
  });
  console.log("[seed] Assigned portfolio to client");

  // Create some sample news articles
  const newsSource = await prisma.newsSource.upsert({
    where: { slug: "gem-intel" },
    update: {},
    create: {
      name: "GEM Intel",
      slug: "gem-intel",
      feedUrl: "https://gem-enterprise.test/rss",
      siteUrl: "https://gem-enterprise.test",
      category: "cybersecurity",
      description: "GEM Enterprise internal intelligence feed",
    },
  });
  console.log("[seed] Created/updated news source:", newsSource.name);

  // Create sample articles
  const articles = [
    {
      title: "Global Cyber Threat Landscape 2026",
      summary: "An in-depth analysis of emerging cyber threats and defense strategies.",
      category: "cybersecurity" as const,
      isFeatured: true,
    },
    {
      title: "Digital Asset Regulatory Update",
      summary: "Latest developments in cryptocurrency and digital asset regulations worldwide.",
      category: "policy" as const,
      isFeatured: false,
    },
    {
      title: "Alternative Investment Opportunities",
      summary: "Exploring high-yield alternative investments in the current market.",
      category: "alternatives" as const,
      isFeatured: false,
    },
  ];

  for (const article of articles) {
    const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.newsArticle.upsert({
      where: { slug },
      update: {},
      create: {
        sourceId: newsSource.id,
        externalGuid: `gem-${slug}`,
        externalUrl: `https://gem-enterprise.test/news/${slug}`,
        slug,
        title: article.title,
        summary: article.summary,
        category: article.category,
        isFeatured: article.isFeatured,
        publishedAt: new Date(),
        status: "published",
      },
    });
    console.log("[seed] Created/updated article:", article.title);
  }

  console.log("\n[seed] Seed completed successfully!");
  console.log("\n=== Test Credentials ===");
  console.log("Client (KYC Approved):");
  console.log("  Email: client@gem-enterprise.test");
  console.log("  Password: TestClient123!");
  console.log("\nAdmin:");
  console.log("  Email: admin@gem-enterprise.test");
  console.log("  Password: TestAdmin123!");
  console.log("\nPending KYC User:");
  console.log("  Email: pending@gem-enterprise.test");
  console.log("  Password: TestPending123!");
}

main()
  .catch((e) => {
    console.error("[seed] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
