import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const vendors = [
  {
    name: "RK Elegant Decorations",
    email: "decoration@rkeventra.com",
    businessName: "RK Elegant Decorations",
    description:
      "Beautiful wedding, birthday, engagement and reception decoration services.",
    location: "Chennai",
    rating: 4.7,
    service: {
      name: "Premium Event Decoration",
      description:
        "Complete stage decoration, flower decoration, backdrop and venue decoration.",
      category: "Decoration",
      price: 25000,
    },
  },
  {
    name: "RK Moments Photography",
    email: "photography@rkeventra.com",
    businessName: "RK Moments Photography",
    description:
      "Professional wedding, birthday and event photography and videography.",
    location: "Chennai",
    rating: 4.9,
    service: {
      name: "Wedding Photography",
      description:
        "Professional photography and videography for weddings and special events.",
      category: "Photography",
      price: 30000,
    },
  },
  {
    name: "RK Grand Stage Works",
    email: "stage@rkeventra.com",
    businessName: "RK Grand Stage Works",
    description:
      "Complete stage, backdrop, LED screen and event lighting solutions.",
    location: "Chennai",
    rating: 4.6,
    service: {
      name: "Premium Stage Setup",
      description:
        "Complete stage setup with backdrop, lighting and LED screen arrangements.",
      category: "Stage Setup",
      price: 20000,
    },
  },
  {
    name: "RK Royal Catering",
    email: "catering@rkeventra.com",
    businessName: "RK Royal Catering",
    description:
      "Quality vegetarian and non-vegetarian catering for weddings and events.",
    location: "Chennai",
    rating: 4.8,
    service: {
      name: "Wedding Catering",
      description:
        "Complete event catering with traditional South Indian and special menus.",
      category: "Catering",
      price: 50000,
    },
  },
  {
    name: "RK Bridal Beauty Studio",
    email: "makeup@rkeventra.com",
    businessName: "RK Bridal Beauty Studio",
    description:
      "Professional bridal makeup, hairstyle and beauty services.",
    location: "Chennai",
    rating: 4.9,
    service: {
      name: "Bridal Makeup Package",
      description:
        "Complete bridal makeup, hairstyle and beauty preparation package.",
      category: "Makeup & Bridal",
      price: 15000,
    },
  },
];

async function main() {
  const password = await bcrypt.hash("123456", 12);

  for (const item of vendors) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: item.email,
      },
    });

    let user;

    if (existingUser) {
      user = existingUser;
    } else {
      user = await prisma.user.create({
        data: {
          name: item.name,
          email: item.email,
          phone: null,
          password,
          role: "VENDOR",
        },
      });
    }

    const existingVendor = await prisma.vendor.findUnique({
      where: {
        userId: user.id,
      },
    });

    let vendor;

    if (existingVendor) {
      vendor = existingVendor;
    } else {
      vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          businessName: item.businessName,
          description: item.description,
          location: item.location,
          rating: item.rating,
        },
      });
    }

    const existingService = await prisma.service.findFirst({
      where: {
        vendorId: vendor.id,
        category: item.service.category,
      },
    });

    if (!existingService) {
      await prisma.service.create({
        data: {
          vendorId: vendor.id,
          name: item.service.name,
          description: item.service.description,
          category: item.service.category,
          price: item.service.price,
        },
      });
    }

    console.log(`Added: ${item.businessName}`);
  }

  console.log("All vendors and services processed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });