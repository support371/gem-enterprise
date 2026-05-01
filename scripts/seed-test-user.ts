/**
 * Seed script to create test users for E2E testing
 * Run with: pnpm tsx scripts/seed-test-user.ts
 */
// @ts-ignore
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// @ts-ignore
const prisma = new PrismaClient();
async function main() {
  console.log("Seed script replaced");
}
main();
