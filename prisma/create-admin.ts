import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@fnetwater.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Kwaku Frimpong (Admin)";
  const phone = process.env.ADMIN_PHONE || "0241000001";

  console.log(`Setting up Administrator account for ${email}...`);
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  if (existing) {
    console.log(`User ${email} already exists. Updating to Administrator...`);
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        password: hashedPassword,
        name,
      },
    });
    console.log(`✅ Administrator ${email} updated successfully!`);
  } else {
    console.log(`Creating new Administrator ${email}...`);
    const created = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
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
