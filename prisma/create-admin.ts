import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../lib/generated/prisma/client";
import { UserRole, UserStatus } from "../lib/generated/prisma/enums";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const email = (process.env.ADMIN_EMAIL || "samcuxx@gmail.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "100%forSamCux";
  const fullName = process.env.ADMIN_NAME || "Sam Cux";
  const phone = process.env.ADMIN_PHONE || "0240000000";

  console.log(`Hashing password for ${email}...`);
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`User ${email} already exists. Updating to Administrator...`);
    const updated = await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        fullName,
        role: UserRole.ADMINISTRATOR,
        status: UserStatus.ACTIVE,
      },
    });

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: updated.id },
    });

    if (!staff) {
      await prisma.staffProfile.create({
        data: {
          userId: updated.id,
          staffCode: `STF-${Date.now().toString().slice(-4)}`,
          department: "Executive",
          jobTitle: "Super Administrator",
        },
      });
    }

    console.log(`✅ Administrator ${email} updated successfully!`);
  } else {
    console.log(`Creating new Administrator ${email}...`);
    const created = await prisma.user.create({
      data: {
        code: `ADM-${Date.now().toString().slice(-6)}`,
        email,
        phone,
        passwordHash,
        fullName,
        role: UserRole.ADMINISTRATOR,
        status: UserStatus.ACTIVE,
        staffProfile: {
          create: {
            staffCode: `STF-${Date.now().toString().slice(-4)}`,
            department: "Executive",
            jobTitle: "Super Administrator",
          },
        },
      },
    });
    console.log(`✅ Administrator ${email} created with ID: ${created.id}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
