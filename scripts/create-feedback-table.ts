import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS CustomerFeedback (
      id VARCHAR(191) PRIMARY KEY,
      userId VARCHAR(191) NULL,
      customerName VARCHAR(255) NOT NULL,
      customerEmail VARCHAR(255) NULL,
      rating INT NOT NULL DEFAULT 5,
      category VARCHAR(100) NOT NULL DEFAULT 'PLATFORM',
      vendorName VARCHAR(255) NULL,
      comment TEXT NOT NULL,
      isFeatured BOOLEAN NOT NULL DEFAULT FALSE,
      helpfulCount INT NOT NULL DEFAULT 0,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX idx_feedback_user (userId),
      INDEX idx_feedback_rating (rating),
      INDEX idx_feedback_category (category)
    );
  `);
  console.log("CustomerFeedback table successfully verified/created in database!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
