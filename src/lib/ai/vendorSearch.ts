import { prisma } from "@/src/lib/prisma";
import { ExtractedEntities } from "./nlp";

export interface SearchVendorResult {
  id: string;
  businessName: string;
  description: string | null;
  location: string | null;
  rating: number;
  profileImage: string | null;
  status: string;
  services: {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string | null;
    packages: {
      id: string;
      name: string;
      price: number;
      description: string | null;
      features: string | null;
    }[];
  }[];
  minPrice: number;
  reviewCount: number;
}

export async function searchVendorsFromDb(entities: ExtractedEntities): Promise<SearchVendorResult[]> {
  const { serviceCategory, location, budget } = entities;

  // Base where clause: MUST be APPROVED
  const where: any = {
    status: "APPROVED",
  };

  // Location filter
  if (location && location.trim() !== "") {
    where.location = {
      contains: location.trim(),
    };
  }

  // Fetch approved vendors with their active services, packages, and review count
  const vendors = await prisma.vendor.findMany({
    where,
    include: {
      services: {
        where: {
          active: true,
          ...(serviceCategory
            ? {
                OR: [
                  { category: { contains: serviceCategory } },
                  { category: { contains: serviceCategory.split(" ")[0] } },
                  { name: { contains: serviceCategory.split(" ")[0] } },
                ],
              }
            : {}),
          ...(budget ? { price: { lte: budget } } : {}),
        },
        include: {
          packages: {
            where: { active: true },
          },
        },
      },
      bookings: {
        include: {
          review: true,
        },
      },
    },
    orderBy: {
      rating: "desc",
    },
  });

  // Transform and compute genuine pricing & review counts
  const results: SearchVendorResult[] = [];

  for (const v of vendors) {
    // If a serviceCategory or budget was requested, vendor must have at least 1 matching service
    if (serviceCategory || budget) {
      if (v.services.length === 0) {
        continue;
      }
    }

    // Collect genuine reviews count
    const validReviews = v.bookings.map((b) => b.review).filter(Boolean);
    const reviewCount = validReviews.length;

    // Minimum price among services or packages
    let minPrice = 0;
    if (v.services.length > 0) {
      const prices = v.services.map((s) => s.price);
      for (const s of v.services) {
        if (s.packages && s.packages.length > 0) {
          prices.push(...s.packages.map((p) => p.price));
        }
      }
      minPrice = Math.min(...prices);
    }

    results.push({
      id: v.id,
      businessName: v.businessName,
      description: v.description,
      location: v.location,
      rating: v.rating,
      profileImage: v.profileImage,
      status: v.status,
      services: v.services.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        price: s.price,
        description: s.description,
        packages: s.packages.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          features: p.features,
        })),
      })),
      minPrice,
      reviewCount,
    });
  }

  return results;
}
