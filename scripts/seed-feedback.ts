import { prisma } from "../src/lib/prisma";

async function main() {
  const existingCount = await prisma.customerFeedback.count();
  if (existingCount === 0) {
    await prisma.customerFeedback.createMany({
      data: [
        {
          customerName: "Ananya & Karthik Subramanian",
          customerEmail: "karthik.subramanian@gmail.com",
          rating: 5,
          category: "VENDOR_SERVICE",
          vendorName: "Grand Royal Decors Chennai",
          comment: "Our wedding reception floral mandap in ECR was absolutely breathtaking! The champagne gold lighting and fresh jasmine garlands matched our exact dream. Every single guest complimented the decor.",
          isFeatured: true,
          helpfulCount: 42,
        },
        {
          customerName: "Vikramaditya Rajan",
          customerEmail: "vikram.rajan@techcorp.in",
          rating: 5,
          category: "PLATFORM",
          vendorName: "DJ Alex Beats & Sound",
          comment: "RK Eventra made booking a concert-grade JBL Line Array and moving beam lighting effortless for our annual company gala in Coimbatore. Transparent pricing with escrow security is a game changer in Tamil Nadu!",
          isFeatured: true,
          helpfulCount: 29,
        },
        {
          customerName: "Priya Soundararajan",
          customerEmail: "priya.soundar@yahoo.com",
          rating: 5,
          category: "BOOKING_EXPERIENCE",
          vendorName: "Elite Cinematic Weddings",
          comment: "The 4K cinematic wedding film and drone coverage were delivered within 2 weeks. The online booking and direct vendor communication through RK Eventra was seamless and crystal clear.",
          isFeatured: true,
          helpfulCount: 35,
        },
        {
          customerName: "Dr. Murali Krishnan",
          customerEmail: "murali.krishnan@apollo.org",
          rating: 5,
          category: "VENDOR_SERVICE",
          vendorName: "Sri Krishna Royal Catering",
          comment: "Authentic Chettinad and traditional South Indian elai saapadu for our daughter's engagement in Madurai. The food quality and service staff were courteous, punctual, and top notch.",
          isFeatured: true,
          helpfulCount: 18,
        },
        {
          customerName: "Deepak & Sneha Reddy",
          customerEmail: "deepak.sneha@gmail.com",
          rating: 5,
          category: "RK_AI",
          vendorName: "RK AI Event Planner",
          comment: "The RK AI assistant helped us estimate our entire sound, lighting, and stage budget in under 3 minutes with real vendor packages. Highly recommended for busy couples planning a wedding!",
          isFeatured: true,
          helpfulCount: 24,
        },
      ],
    });
    console.log("Seeded 5 featured customer feedbacks!");
  } else {
    console.log("Feedbacks already exist, count:", existingCount);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
