import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not configured"
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email =
    process.env.RK_ADMIN_EMAIL ||
    "admin@rkeventra.com";

  const password =
    process.env.RK_ADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      "RK_ADMIN_PASSWORD must be configured in .env"
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 12);

  const admin =
    await prisma.user.upsert({
      where: {
        email,
      },

      update: {
        name: "RK EVENTRA Administrator",
        password: hashedPassword,
        role: "ADMIN",
      },

      create: {
        name: "RK EVENTRA Administrator",
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    "       RK EVENTRA ADMIN READY"
  );
  console.log(
    "======================================"
  );
  console.log("Email :", admin.email);
  console.log("Role  :", admin.role);
  console.log(
    "Password is loaded securely from .env"
  );
  console.log(
    "======================================"
  );
  console.log("");
}

main()
  .catch((error) => {
    console.error(
      "ADMIN SEED ERROR:",
      error
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
