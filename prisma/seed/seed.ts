import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL || "mysql://root:karthi2008@localhost:3306/rkeventra";
const connectionString = databaseUrl.replace(/^mysql:\/\//, "mariadb://");
const pool = mariadb.createPool(connectionString);
const adapter = new PrismaMariaDb(pool as any);
const prisma = new PrismaClient({ adapter });

const categoriesData = [
  { name: "DJ and Entertainment", slug: "dj-and-entertainment", description: "Professional DJs, live music, emcees, and dance floor entertainment.", icon: "Disc3", displayOrder: 1 },
  { name: "Audio and Sound Systems", slug: "audio-and-sound-systems", description: "High-output line array speakers, mixers, wireless mics, and subwoofers.", icon: "Volume2", displayOrder: 2 },
  { name: "Lighting Systems", slug: "lighting-systems", description: "Decorative ambient lighting, moving heads, par cans, trusses, and laser shows.", icon: "Zap", displayOrder: 3 },
  { name: "Wedding Decoration", slug: "wedding-decoration", description: "Bespoke traditional, contemporary, and luxury wedding themes and mandap decor.", icon: "Sparkles", displayOrder: 4 },
  { name: "Stage Decoration", slug: "stage-decoration", description: "Custom backdrops, LED wall backdrops, entrance arches, and royal stage setups.", icon: "Layers", displayOrder: 5 },
  { name: "Photography", slug: "photography", description: "Candid wedding, pre-wedding, birthday, and traditional event photography.", icon: "Camera", displayOrder: 6 },
  { name: "Videography", slug: "videography", description: "Cinematic 4K event coverage, teaser reels, live webcasting, and drone filming.", icon: "Video", displayOrder: 7 },
  { name: "Catering", slug: "catering", description: "Authentic South Indian feast, North Indian, live counters, and banquet catering.", icon: "Utensils", displayOrder: 8 },
  { name: "Makeup and Styling", slug: "makeup-and-styling", description: "Bridal makeover, hairstyling, saree draping, and groom grooming services.", icon: "Heart", displayOrder: 9 },
  { name: "Flower Decoration", slug: "flower-decoration", description: "Fresh jasmine garlands, orchid floral backdrops, and floral pathway decor.", icon: "Flower2", displayOrder: 10 },
  { name: "Generator Services", slug: "generator-services", description: "Silent diesel generators (15kVA - 125kVA) with onsite fuel and technicians.", icon: "Power", displayOrder: 11 },
  { name: "Event Planning", slug: "event-planning", description: "End-to-end wedding and event management, timeline scheduling, and coordination.", icon: "Calendar", displayOrder: 12 },
  { name: "Furniture and Seating", slug: "furniture-and-seating", description: "Banquet chairs, round tables, shamiana tents, VIP sofas, and royal thrones.", icon: "Armchair", displayOrder: 13 },
  { name: "Other Event Services", slug: "other-event-services", description: "Event security, valet parking, cold pyro, confetti blasts, and welcome dancers.", icon: "Star", displayOrder: 14 },
];

async function main() {
  console.log("Starting comprehensive RK EVENTRA seed...");

  // 1. Categories
  console.log("Seeding categories...");
  for (const cat of categoriesData) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, displayOrder: cat.displayOrder, active: true },
      create: { name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon, displayOrder: cat.displayOrder, active: true },
    });
  }

  // 2. Default platform settings
  await prisma.platformSetting.upsert({
    where: { key: "platform_commission_percent" },
    update: { value: "10" },
    create: { key: "platform_commission_percent", value: "10", description: "Default platform commission percentage (10%)" },
  });
  await prisma.platformSetting.upsert({
    where: { key: "vendor_joining_fee" },
    update: { value: "800" },
    create: { key: "vendor_joining_fee", value: "800", description: "Vendor joining fee in INR (₹800)" },
  });
  await prisma.platformSetting.upsert({
    where: { key: "gst_percent" },
    update: { value: "18" },
    create: { key: "gst_percent", value: "18", description: "Applicable GST percentage (18%)" },
  });

  // Passwords
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const customerPassword = await bcrypt.hash("Customer@12345", 10);
  const vendorPassword = await bcrypt.hash("Vendor@12345", 10);

  // 3. Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@rkeventra.com" },
    update: { name: "RK Administrator", phone: "9840011223", password: adminPassword, role: "ADMIN" },
    create: { name: "RK Administrator", email: "admin@rkeventra.com", phone: "9840011223", password: adminPassword, role: "ADMIN" },
  });
  console.log("Admin ready:", admin.email);

  // 4. Test Customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@rkeventra.com" },
    update: { name: "Karthi User", phone: "9876543210", password: customerPassword, role: "CUSTOMER" },
    create: { name: "Karthi User", email: "customer@rkeventra.com", phone: "9876543210", password: customerPassword, role: "CUSTOMER" },
  });
  console.log("Customer ready:", customer.email);

  // 5. Vendors seed list
  const vendorsList = [
    {
      email: "chengalpattu.dj@rkeventra.com",
      name: "Suresh DJ Beats",
      phone: "9841122334",
      businessName: "Chengalpattu Beats DJ & Sound",
      description: "Top-rated wedding and party DJ in Chengalpattu with JBL line arrays, smoke machines, LED dance floors, and live sound mixing.",
      location: "Chengalpattu, Tamil Nadu",
      rating: 4.9,
      services: [
        {
          id: "svc-cpt-dj-1",
          name: "Wedding & Reception DJ Package",
          category: "DJ and Entertainment",
          price: 14000,
          description: "High-energy DJ setup for weddings and receptions in Chengalpattu with wireless microphones, JBL audio, and dance floor lighting.",
          packages: [
            { name: "Silver Wedding DJ", price: 12000, description: "3 hours nonstop DJ + 2 JBL tops + 2 wireless mics + par can lights", features: "3 Hours DJ, 2 Speakers, 2 Mics, Par Cans" },
            { name: "Gold Wedding DJ", price: 14000, description: "5 hours wedding DJ + 4 JBL tops + 2 subwoofers + LED lights + haze effect", features: "5 Hours DJ, 4 Speakers, 2 Subs, LED Lights, Haze" },
            { name: "Platinum Extravaganza", price: 18000, description: "Full evening DJ + truss lighting + laser show + cold fire pyro", features: "Unlimited Evening, Truss, Lasers, Pyro" },
          ],
        },
      ],
    },
    {
      email: "chennai.dj@rkeventra.com",
      name: "DJ Arun Master",
      phone: "9841133445",
      businessName: "RK Sound & DJ Entertainment Chennai",
      description: "Premier Chennai DJ service specializing in Tamil cinematic, Bollywood, and international EDM wedding events with cutting-edge sound.",
      location: "Chennai, Tamil Nadu",
      rating: 4.8,
      services: [
        {
          id: "svc-chn-dj-1",
          name: "Cinematic Wedding DJ Show",
          category: "DJ and Entertainment",
          price: 15000,
          description: "Full concert-grade sound with Pioneer DJ console, active subwoofers, moving head beam lights, and party MC.",
          packages: [
            { name: "Standard DJ", price: 15000, description: "Pioneer DDJ setup with 4 top speakers and basic disco lights", features: "Pioneer DJ, 4 Speakers, Basic Lights" },
            { name: "Club Experience", price: 22000, description: "Concert sound with dual bass bins, moving beams, and DJ MC", features: "Dual Bass, Moving Heads, MC Included" },
          ],
        },
        {
          id: "svc-chn-sound-1",
          name: "Live Audio & Sound System Setup",
          category: "Audio and Sound Systems",
          price: 11000,
          description: "Crystal-clear acoustic sound system for wedding halls, engagement ceremonies, and stage speakers.",
          packages: [
            { name: "Acoustic Stage Sound", price: 11000, description: "Digital audio mixer with 6 wireless microphones and 4 hall speakers", features: "Digital Mixer, 6 Wireless Mics, 4 Hall Speakers" },
          ],
        },
      ],
    },
    {
      email: "decor.chengalpattu@rkeventra.com",
      name: "Malar Decorators",
      phone: "9841144556",
      businessName: "Malar Event & Wedding Decorators",
      description: "Exquisite wedding stage decoration, flower backdrops, entrance arches, and birthday balloon themes across Chengalpattu and Tambaram.",
      location: "Chengalpattu, Tamil Nadu",
      rating: 4.9,
      services: [
        {
          id: "svc-cpt-dec-1",
          name: "Traditional Wedding & Stage Decor",
          category: "Wedding Decoration",
          price: 22000,
          description: "Royal mandapam flower decor, LED name board, entrance arch, and red carpet walkway.",
          packages: [
            { name: "Classic Mandap Decor", price: 18000, description: "Traditional marigold and jasmine mandap backdrop with warm lighting", features: "Fresh Flowers, Traditional Arch, Halogen Lighting" },
            { name: "Grand Royal Wedding Decor", price: 25000, description: "Full luxury fabric draping, exotic imported orchids, fiber pillars, and LED walkway", features: "Exotic Orchids, Fiber Pillars, LED Walkway" },
          ],
        },
        {
          id: "svc-cpt-bday-1",
          name: "Birthday Party Theme Decoration",
          category: "Wedding Decoration",
          price: 8000,
          description: "Creative cartoon, jungle, prince/princess balloon arches and neon sign backdrops.",
          packages: [
            { name: "Kids Birthday Special", price: 8000, description: "Complete balloon arch, backdrop flex, and cake table setup", features: "Balloon Arch, Custom Banner, Cake Table Decor" },
          ],
        },
      ],
    },
    {
      email: "catering.royal@rkeventra.com",
      name: "Chef Natarajan",
      phone: "9841155667",
      businessName: "Annapoorna Royal Wedding Catering",
      description: "Authentic South Indian banana leaf wedding feast and grand multi-cuisine buffet for weddings, engagements, and birthdays.",
      location: "Chennai, Tamil Nadu",
      rating: 4.8,
      services: [
        {
          id: "svc-cat-1",
          name: "Grand Wedding Feast (Per 100 Guests)",
          category: "Catering",
          price: 35000,
          description: "Traditional 24-item South Indian royal wedding lunch on fresh banana leaf with live sweet counters.",
          packages: [
            { name: "Traditional 24-Item Feast", price: 35000, description: "Includes 3 varieties of payasam, vadai, appalam, sambar, rasam, and 4 poriyals", features: "24 Items, Unlimited Servings, Clean Uniformed Service" },
            { name: "Multi-Cuisine Buffet", price: 48000, description: "South Indian + North Indian roti counter, paneer butter masala, and ice cream counter", features: "Multi-Cuisine, Live Roti Counter, Ice Cream Bar" },
          ],
        },
      ],
    },
    {
      email: "photo.karthi@rkeventra.com",
      name: "Karthik Visuals",
      phone: "9841166778",
      businessName: "Karthi Moments Wedding Photography & Cinema",
      description: "Sony Alpha 4K wedding cinematography, candid moments, traditional albums, teaser reels, and live YouTube streaming.",
      location: "Chennai, Tamil Nadu",
      rating: 4.9,
      services: [
        {
          id: "svc-photo-1",
          name: "Complete Wedding Photography & 4K Video",
          category: "Photography",
          price: 28000,
          description: "2 candid photographers + 2 cinematic videographers + premium photobook album + 4K teaser video.",
          packages: [
            { name: "Standard Wedding Coverage", price: 20000, description: "1 Candid + 1 Traditional Photographer + 40-page photobook album", features: "2 Photographers, 40-Page Album, High-Res Pen Drive" },
            { name: "Cinematic Film Package", price: 28000, description: "Drone shots + 2 Photographers + 2 Videographers + 4K Wedding Cinema Reel", features: "Drone Filming, Cinematic Teaser, 50-Page Velvet Album" },
          ],
        },
      ],
    },
    {
      email: "generator.power@rkeventra.com",
      name: "Venkatesh Power",
      phone: "9841177889",
      businessName: "PowerStar Event Generators & Lighting",
      description: "Reliable silent generators from 25kVA to 82.5kVA with seamless automatic switchover for wedding halls and outdoor DJ events.",
      location: "Chengalpattu, Tamil Nadu",
      rating: 4.7,
      services: [
        {
          id: "svc-gen-1",
          name: "Silent Diesel Generator (40 kVA)",
          category: "Generator Services",
          price: 8500,
          description: "Complete 8-hour generator power backup with diesel included and onsite technical engineer.",
          packages: [
            { name: "8 Hours 40kVA Backup", price: 8500, description: "Covers entire wedding hall stage lights, DJ sound, and basic air conditioning", features: "Includes Diesel, Standby Technician, Cables" },
          ],
        },
      ],
    },
  ];

  console.log("Seeding vendors and packages...");
  for (const vData of vendorsList) {
    const user = await prisma.user.upsert({
      where: { email: vData.email },
      update: { name: vData.name, phone: vData.phone, password: vendorPassword, role: "VENDOR" },
      create: { name: vData.name, email: vData.email, phone: vData.phone, password: vendorPassword, role: "VENDOR" },
    });

    const vendor = await prisma.vendor.upsert({
      where: { userId: user.id },
      update: {
        businessName: vData.businessName,
        description: vData.description,
        location: vData.location,
        rating: vData.rating,
        status: "APPROVED",
        approvedAt: new Date(),
        profileImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      },
      create: {
        userId: user.id,
        businessName: vData.businessName,
        description: vData.description,
        location: vData.location,
        rating: vData.rating,
        status: "APPROVED",
        approvedAt: new Date(),
        profileImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      },
    });

    // Record verified ₹800 joining fee payment for each approved vendor
    await prisma.vendorJoinPayment.upsert({
      where: { razorpayOrderId: `order_join_${vendor.id}` },
      update: { status: "PAID", paidAt: new Date() },
      create: {
        vendorId: vendor.id,
        userId: user.id,
        amount: 800,
        currency: "INR",
        status: "PAID",
        razorpayOrderId: `order_join_${vendor.id}`,
        razorpayPaymentId: `pay_join_${vendor.id}`,
        transactionId: `tx_join_${vendor.id}`,
        paidAt: new Date(),
        verifiedById: admin.id,
      },
    });

    // Ledger entry for joining fee
    await prisma.financialLedgerEntry.create({
      data: {
        entryType: "JOINING_FEE",
        referenceType: "VENDOR_JOIN",
        referenceId: vendor.id,
        credit: 800,
        debit: 0,
        balance: 800,
        description: `Vendor joining fee collected from ${vendor.businessName} (₹800)`,
      },
    });

    // Portfolio
    await prisma.portfolio.createMany({
      data: [
        { vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", title: "Live Grand Setup" },
        { vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80", title: "Celebration Night" },
      ],
      skipDuplicates: true,
    });

    // Availabilities (next 60 days)
    const today = new Date();
    for (let i = 1; i <= 60; i++) {
      const slotDate = new Date(today);
      slotDate.setHours(0, 0, 0, 0);
      slotDate.setDate(slotDate.getDate() + i);
      await prisma.availability.upsert({
        where: { vendorId_date: { vendorId: vendor.id, date: slotDate } },
        update: { available: true },
        create: { vendorId: vendor.id, date: slotDate, available: true },
      });
    }

    // Services and Packages
    for (const sData of vData.services) {
      const service = await prisma.service.upsert({
        where: { id: sData.id },
        update: {
          vendorId: vendor.id,
          name: sData.name,
          category: sData.category,
          price: sData.price,
          description: sData.description,
          active: true,
        },
        create: {
          id: sData.id,
          vendorId: vendor.id,
          name: sData.name,
          category: sData.category,
          price: sData.price,
          description: sData.description,
          active: true,
        },
      });

      if (sData.packages) {
        for (const pkg of sData.packages) {
          const pkgId = `pkg-${service.id}-${pkg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          await prisma.servicePackage.upsert({
            where: { id: pkgId },
            update: { name: pkg.name, price: pkg.price, description: pkg.description, features: pkg.features, active: true },
            create: { id: pkgId, serviceId: service.id, name: pkg.name, price: pkg.price, description: pkg.description, features: pkg.features, active: true },
          });
        }
      }
    }

    console.log(`Ready vendor: ${vendor.businessName} (${vData.location})`);
  }

  // 6. Create sample verified booking & review for customer
  const firstVendor = await prisma.vendor.findFirst({ where: { businessName: { contains: "Chengalpattu" } } });
  const firstService = await prisma.service.findFirst({ where: { vendorId: firstVendor?.id } });
  if (firstVendor && firstService) {
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 14);

    const booking = await prisma.booking.upsert({
      where: { id: "booking-demo-cpt-1" },
      update: { status: "CONFIRMED" },
      create: {
        id: "booking-demo-cpt-1",
        customerId: customer.id,
        vendorId: firstVendor.id,
        serviceId: firstService.id,
        eventDate: bookingDate,
        eventType: "Wedding",
        location: "Chengalpattu, Tamil Nadu",
        totalAmount: 14000,
        serviceAmount: 14000,
        platformFee: 1400,
        subtotal: 14000,
        status: "CONFIRMED",
      },
    });

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: { status: "PAID" },
      create: {
        bookingId: booking.id,
        customerId: customer.id,
        amount: 14000,
        currency: "INR",
        status: "PAID",
        paymentMethod: "UPI",
        transactionId: "TXN_DEMO_14000",
        paidAt: new Date(),
      },
    });

    await prisma.review.upsert({
      where: { bookingId: booking.id },
      update: { rating: 5, comment: "Superb DJ service! Music selection was awesome for our wedding reception." },
      create: {
        bookingId: booking.id,
        customerId: customer.id,
        rating: 5,
        comment: "Superb DJ service! Music selection was awesome for our wedding reception.",
      },
    });

    await prisma.bookingFinancials.upsert({
      where: { bookingId: booking.id },
      update: { grossAmount: 14000 },
      create: {
        bookingId: booking.id,
        grossAmount: 14000,
        basePrice: 14000,
        platformFee: 1400,
        commissionRate: 10,
        commissionAmount: 1400,
        vendorEarnings: 12600,
        status: "PENDING",
      },
    });
  }

  console.log("\n========================================================");
  console.log("       RK EVENTRA EXPANDED DATABASE SEED READY          ");
  console.log("========================================================");
  console.log("Categories   : 14 Real Event Categories");
  console.log("Vendors      : DJ, Sound, Lighting, Decoration, Catering, Photo, Generator");
  console.log("Locations    : Chengalpattu, Chennai, Tamil Nadu");
  console.log("Joining Fees : ₹800 recorded per approved vendor");
  console.log("Settings     : Commission 10%, Joining Fee ₹800, GST 18%");
  console.log("========================================================\n");
}

main()
  .catch((err) => {
    console.error("SEED ERROR:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
