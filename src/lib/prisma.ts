import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: any;
};

const databaseUrl = process.env.DATABASE_URL || "mysql://root:karthi2008@localhost:3306/rkeventra";
let connectionString = databaseUrl.replace(/^mysql:\/\//, "mariadb://");
if (!connectionString.includes("allowPublicKeyRetrieval")) {
  connectionString += (connectionString.includes("?") ? "&" : "?") + "allowPublicKeyRetrieval=true";
}

const pool = globalForPrisma.pool ?? mariadb.createPool(connectionString);
const adapter = new PrismaMariaDb(pool as any);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
