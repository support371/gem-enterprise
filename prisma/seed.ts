import { PrismaClient, UserRole, EntityType, KYCStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding GEM Enterprise database...");

  // Admin user
  const adminHash = await bcrypt.hash("admin@gemEnterprise2026!", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@gem-enterprise.com" },
    update: {},
    create: {
      email: "admin@gem-enterprise.com",
      passwordHash: adminHash,
      role: UserRole.admin,
      isActive: true,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: "GEM",
          lastName: "Administrator",
          displayName: "Admin",
          entityType: EntityType.individual,
        },
      },
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Demo approved client
  const clientHash = await bcrypt.hash("client@demo2026!", 12);
  const client = await db.user.upsert({
    where: { email: "demo@gem-enterprise.com" },
    update: {},
    create: {
      email: "demo@gem-enterprise.com",
      passwordHash: clientHash,
      role: UserRole.client,
      isActive: true,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: "Alexandra",
          lastName: "Chen",
          displayName: "Alexandra C.",
          entityType: EntityType.individual,
          country: "US",
          accreditedStatus: true,
        },
      },
    },
  });
  console.log(`✅ Demo client: ${client.email}`);

  // Approved KYC for demo client
  const existingKyc = await db.kYCApplication.findFirst({
    where: { userId: client.id },
  });

  if (!existingKyc) {
    const kyc = await db.kYCApplication.create({
      data: {
        userId: client.id,
        entityType: EntityType.individual,
        status: KYCStatus.approved,
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        formData: {
          firstName: "Alexandra",
          lastName: "Chen",
          country: "US",
          sourceOfFunds: "Employment income and investment returns",
          investmentObjective: "Capital preservation and growth",
        },
        decision: {
          create: {
            decision: "approved",
            decisionBy: admin.id,
            reason: "All documents verified. Accredited investor status confirmed.",
          },
        },
      },
    });
    console.log(`✅ KYC application created: ${kyc.id}`);
  }

  // Entitlements for demo client
  await db.entitlement.upsert({
    where: { id: `ent_cyber_${client.id}` },
    update: {},
    create: {
      id: `ent_cyber_${client.id}`,
      userId: client.id,
      slug: "cyber",
      grantedBy: admin.id,
    },
  });

  await db.entitlement.upsert({
    where: { id: `ent_financial_${client.id}` },
    update: {},
    create: {
      id: `ent_financial_${client.id}`,
      userId: client.id,
      slug: "financial",
      grantedBy: admin.id,
    },
  });
  console.log(`✅ Entitlements granted`);

  // Products
  const products = [
    { slug: "cyber-shield", name: "CyberShield Pro", category: "cyber", description: "Enterprise threat detection and response platform" },
    { slug: "cyber-intel", name: "Intelligence Feed", category: "cyber", description: "Real-time threat intelligence and IOC feeds" },
    { slug: "financial-guard", name: "FinancialGuard", category: "financial", description: "Secure financial transaction monitoring" },
    { slug: "real-estate-protect", name: "PropertyShield", category: "real-estate", description: "Real estate asset protection and title security" },
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log(`✅ Products seeded`);

  // Demo portfolio
  const portfolio = await db.portfolio.upsert({
    where: { id: "portfolio_demo_001" },
    update: {},
    create: {
      id: "portfolio_demo_001",
      name: "GEM Cyber-Financial Portfolio",
      description: "Diversified cybersecurity and financial asset portfolio",
      category: "cyber",
      totalValue: 2500000,
      currency: "USD",
    },
  });

  await db.portfolioMembership.upsert({
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
      assignedBy: admin.id,
    },
  });
  console.log(`✅ Portfolio assigned`);

  // Welcome notification
  await db.notification.create({
    data: {
      userId: client.id,
      title: "Welcome to GEM Enterprise",
      body: "Your account has been approved. You now have full access to your client portal.",
      channel: "in_app",
    },
  });
  console.log(`✅ Welcome notification created`);

  console.log("\n🎉 Seed complete!\n");
  console.log("Demo credentials:");
  console.log("  Admin:  admin@gem-enterprise.com / admin@gemEnterprise2026!");
  console.log("  Client: demo@gem-enterprise.com  / client@demo2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
