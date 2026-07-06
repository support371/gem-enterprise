// @ts-ignore
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// @ts-ignore
const db = new PrismaClient();

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required to seed the production database.`);
  }
  return value;
}

function assertStrongPassword(name: string, value: string) {
  if (value.length < 16) {
    throw new Error(`${name} must be at least 16 characters.`);
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    throw new Error(`${name} must include upper-case, lower-case, numeric, and special characters.`);
  }
}

async function seedAdmin() {
  const adminEmail = requiredEnv("ADMIN_EMAIL").toLowerCase();
  const adminPassword = requiredEnv("ADMIN_INITIAL_PASSWORD");
  assertStrongPassword("ADMIN_INITIAL_PASSWORD", adminPassword);

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {
      isActive: true,
      isEmailVerified: true,
      role: "admin",
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: "admin",
      isActive: true,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: "GEM",
          lastName: "Administrator",
          displayName: "GEM Administrator",
          entityType: "individual",
        },
      },
    },
  });

  console.log(`✅ Admin user ready: ${admin.email}`);
  return admin;
}

async function seedProducts() {
  const products = [
    {
      slug: "cyber-shield",
      name: "CyberShield Pro",
      category: "cyber",
      description: "Enterprise threat detection and response platform",
    },
    {
      slug: "cyber-intel",
      name: "Intelligence Feed",
      category: "cyber",
      description: "Real-time threat intelligence and IOC feeds",
    },
    {
      slug: "financial-guard",
      name: "FinancialGuard",
      category: "financial",
      description: "Secure financial transaction monitoring",
    },
    {
      slug: "real-estate-protect",
      name: "PropertyShield",
      category: "real-estate",
      description: "Real estate asset protection and title security",
    },
  ];

  for (const product of products) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        category: product.category,
        description: product.description,
      },
      create: product,
    });
  }

  console.log("✅ Products ready");
}

async function seedOptionalDemo(adminId: string) {
  if (process.env.SEED_DEMO_DATA !== "true") return;

  const clientEmail = requiredEnv("DEMO_CLIENT_EMAIL").toLowerCase();
  const clientPassword = requiredEnv("DEMO_CLIENT_INITIAL_PASSWORD");
  assertStrongPassword("DEMO_CLIENT_INITIAL_PASSWORD", clientPassword);

  const clientHash = await bcrypt.hash(clientPassword, 12);
  const client = await db.user.upsert({
    where: { email: clientEmail },
    update: {
      isActive: true,
      isEmailVerified: true,
      role: "client",
    },
    create: {
      email: clientEmail,
      passwordHash: clientHash,
      role: "client",
      isActive: true,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: "Demo",
          lastName: "Client",
          displayName: "Demo Client",
          entityType: "individual",
          country: "US",
        },
      },
    },
  });

  await db.entitlement.upsert({
    where: { userId_slug: { userId: client.id, slug: "cyber" } },
    update: {},
    create: {
      userId: client.id,
      slug: "cyber",
      grantedBy: adminId,
    },
  });

  console.log(`✅ Optional demo client ready: ${client.email}`);
}

async function main() {
  console.log("🌱 Seeding GEM Enterprise database...");

  const admin = await seedAdmin();
  await seedProducts();
  await seedOptionalDemo(admin.id);

  console.log("🎉 Seed complete. No passwords were printed or stored in source code.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
