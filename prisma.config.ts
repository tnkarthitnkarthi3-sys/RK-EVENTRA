import "dotenv/config";
import { defineConfig } from "prisma/config";

const dbUrl =
  process.env.DATABASE_URL ||
  "mysql://root:karthi2008@localhost:3306/rkeventra";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/seed.ts",
  },

  datasource: {
    url: dbUrl,
    ...(process.env.SHADOW_DATABASE_URL ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL } : {}),
  },
});
