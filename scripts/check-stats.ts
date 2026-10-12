import { prisma } from "../src/lib/prisma";

async function main() {
  const reviewsCount = await prisma.review.count();
  const bookingsCount = await prisma.booking.count();
  const usersCount = await prisma.user.count();
  console.log("DB Stats:", { reviewsCount, bookingsCount, usersCount });
}

main().finally(() => prisma.$disconnect());
