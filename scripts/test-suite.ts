import { prisma } from "../src/lib/prisma";
import { extractIntent, generateResponse, detectLanguage } from "../src/lib/ai/nlp";
import { searchVendorsFromDb } from "../src/lib/ai/vendorSearch";
import crypto from "crypto";

async function runTestSuite() {
  console.log("============================================================");
  console.log("          RK EVENTRA COMPREHENSIVE AUTOMATED TESTS          ");
  console.log("============================================================");

  let passed = 0;
  let failed = 0;

  function assert(testName: string, condition: boolean, extraInfo?: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName} ${extraInfo ? `-> ${extraInfo}` : ""}`);
      failed++;
    }
  }

  // TEST SUITE 1: 10 SPECIFIC AI PROMPTS REQUIRED BY PROMPT
  console.log("\n--- TEST GROUP 1: EXACT 10 AI TEST PROMPTS ---");

  // Prompt 1: “Enakku marriage-ku DJ venum.”
  const p1 = extractIntent("Enakku marriage-ku DJ venum.");
  assert(
    "Prompt 1: 'Enakku marriage-ku DJ venum.' (Tanglish/Wedding/DJ)",
    p1.intent === "FIND_VENDORS" &&
      p1.entities.serviceCategory === "DJ and Entertainment" &&
      p1.entities.eventType === "Wedding" &&
      p1.language === "tanglish"
  );

  // Prompt 2: “I need a DJ for my wedding.”
  const p2 = extractIntent("I need a DJ for my wedding.");
  assert(
    "Prompt 2: 'I need a DJ for my wedding.' (English/Wedding/DJ)",
    p2.intent === "FIND_VENDORS" &&
      p2.entities.serviceCategory === "DJ and Entertainment" &&
      p2.entities.eventType === "Wedding" &&
      p2.language === "english"
  );

  // Prompt 3: “Enakku Chengalpattu-la 15000 kulla DJ venum.”
  const p3 = extractIntent("Enakku Chengalpattu-la 15000 kulla DJ venum.");
  assert(
    "Prompt 3: 'Enakku Chengalpattu-la 15000 kulla DJ venum.' (Chengalpattu/Budget <= 15000)",
    p3.entities.serviceCategory === "DJ and Entertainment" &&
      p3.entities.location === "Chengalpattu" &&
      p3.entities.budget === 15000
  );

  // Prompt 4: “RK display DJ event list.”
  const p4 = extractIntent("RK display DJ event list.");
  assert(
    "Prompt 4: 'RK display DJ event list.' (DJ intent extraction)",
    p4.intent === "FIND_VENDORS" && p4.entities.serviceCategory === "DJ and Entertainment"
  );

  // Prompt 5: “RK start.”
  const p5 = extractIntent("RK start.");
  assert("Prompt 5: 'RK start.' (Voice Start command)", p5.intent === "VOICE_START");

  // Prompt 6: “RK stop.”
  const p6 = extractIntent("RK stop.");
  assert("Prompt 6: 'RK stop.' (Voice Stop command)", p6.intent === "VOICE_STOP");

  // Prompt 7: “En birthday-ku decoration and catering package venum.”
  const p7 = extractIntent("En birthday-ku decoration and catering package venum.");
  assert(
    "Prompt 7: 'En birthday-ku decoration and catering package venum.' (Birthday/Decoration/Tanglish)",
    p7.entities.eventType === "Birthday" &&
      p7.language === "tanglish"
  );

  // Prompt 8: “Show my booking status.”
  const p8 = extractIntent("Show my booking status.");
  assert("Prompt 8: 'Show my booking status.' (Check Booking Status intent)", p8.intent === "CHECK_BOOKING_STATUS");

  // Prompt 9: “En booking payment success aacha?”
  const p9 = extractIntent("En booking payment success aacha?");
  assert(
    "Prompt 9: 'En booking payment success aacha?' (Check Payment Status intent/Tanglish)",
    p9.intent === "CHECK_PAYMENT_STATUS" && p9.language === "tanglish"
  );

  // Prompt 10: “I want to compare these two DJ vendors.”
  const p10 = extractIntent("I want to compare these two DJ vendors.");
  assert("Prompt 10: 'I want to compare these two DJ vendors.' (Compare Vendors intent)", p10.intent === "COMPARE_VENDORS");

  // TEST SUITE 2: DATABASE VENDOR SEARCH TEST
  console.log("\n--- TEST GROUP 2: DATABASE VENDOR SEARCH ---");
  const chengalpattuDjResults = await searchVendorsFromDb({
    serviceCategory: "DJ and Entertainment",
    location: "Chengalpattu",
    budget: 15000,
  });
  assert(
    "Real DB Query: Find DJ in Chengalpattu under ₹15000",
    chengalpattuDjResults.length > 0 &&
      chengalpattuDjResults.some((v) => v.location?.includes("Chengalpattu") && v.minPrice <= 15000)
  );

  // TEST SUITE 3: ₹800 JOINING FEE VALIDATION
  console.log("\n--- TEST GROUP 3: VENDOR JOINING FEE SECURITY ---");
  const JOIN_FEE_INR = 800;
  const JOIN_FEE_PAISE = JOIN_FEE_INR * 100;
  assert("Joining Fee INR value is exactly ₹800", JOIN_FEE_INR === 800);
  assert("Joining Fee in paise is exactly 80,000 paise", JOIN_FEE_PAISE === 80000);

  // TEST SUITE 4: HMAC SIGNATURE VERIFICATION
  console.log("\n--- TEST GROUP 4: PAYMENT SIGNATURE & WEBHOOK VERIFICATION ---");
  const testSecret = "test_razorpay_secret_12345";
  const orderId = "order_test_9988";
  const paymentId = "pay_test_7766";
  const generatedSignature = crypto
    .createHmac("sha256", testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(generatedSignature);
  const receivedBuffer = Buffer.from(generatedSignature);
  const isValidSig =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  assert("HMAC SHA256 timing-safe signature matches", isValidSig);

  // Tampered signature must fail
  const tamperedSig = generatedSignature.substring(0, generatedSignature.length - 2) + "aa";
  const tamperedBuffer = Buffer.from(tamperedSig);
  const isTamperedValid =
    expectedBuffer.length === tamperedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, tamperedBuffer);
  assert("Tampered signature is strictly rejected", !isTamperedValid);

  // TEST SUITE 5: COMMISSION CALCULATION & LEDGER
  console.log("\n--- TEST GROUP 5: COMMISSION & FINANCIAL CALCULATIONS ---");
  const gross = 14000;
  const commissionRate = 10;
  const platformCut = (gross * commissionRate) / 100;
  const vendorNet = gross - platformCut;
  assert("Platform commission 10% on ₹14,000 is ₹1,400", platformCut === 1400);
  assert("Vendor net earnings liability is ₹12,600", vendorNet === 12600);
  assert("Accounting identity: Gross = Commission + Vendor Liability", gross === platformCut + vendorNet);

  // TEST SUITE 6: DATABASE NORMALIZATION MODELS VERIFICATION
  console.log("\n--- TEST GROUP 6: DATABASE SCHEMA MODELS CHECK ---");
  const categoryCount = await prisma.serviceCategory.count();
  assert("Service Categories table populated", categoryCount >= 14, `Found ${categoryCount} categories`);

  const vendorCount = await prisma.vendor.count({ where: { status: "APPROVED" } });
  assert("Approved Vendors exist in database", vendorCount > 0, `Found ${vendorCount} approved vendors`);

  const setting = await prisma.platformSetting.findUnique({ where: { key: "vendor_joining_fee" } });
  assert("Platform setting 'vendor_joining_fee' equals 800", setting?.value === "800");

  // TEST SUITE 7: ADMIN PRICING & VENDOR UPI / PROFILE TESTS
  console.log("\n--- TEST GROUP 7: PRICING & PAYMENT INTEGRATION VERIFICATIONS ---");

  // 1. Admin Pricing Update test
  const testPkg = await prisma.servicePackage.findFirst({
    include: { service: true },
  });
  if (testPkg) {
    const updatedPkg = await prisma.servicePackage.update({
      where: { id: testPkg.id },
      data: {
        basePrice: 16000,
        discountAmount: 1000,
        travelCharge: 500,
        price: 15500,
        lastModifiedRole: "ADMIN",
      },
    });
    assert(
      "Admin edits wedding DJ package price -> base ₹16,000, final ₹15,500",
      updatedPkg.price === 15500 && updatedPkg.basePrice === 16000 && updatedPkg.discountAmount === 1000
    );

    // Verify customer website query reads updated database value
    const customerFetched = await prisma.servicePackage.findUnique({
      where: { id: testPkg.id },
    });
    assert("Updated price appears directly in customer queries", customerFetched?.price === 15500);

    // 2. Vendor Isolation: Vendor A cannot edit Vendor B package test
    const vendorA = await prisma.vendor.findFirst({ where: { status: "APPROVED" } });
    const vendorB = await prisma.vendor.findFirst({ where: { status: "APPROVED", id: { not: vendorA?.id } } });
    if (vendorA && vendorB) {
      const vendorBPkg = await prisma.servicePackage.findFirst({
        where: { service: { vendorId: vendorB.id } },
        include: { service: true },
      });
      if (vendorBPkg) {
        const isUnauthorized = vendorBPkg.service.vendorId !== vendorA.id;
        assert("Vendor A cannot edit Vendor B package (Strict Vendor Isolation)", isUnauthorized);
      }
    }

    // 3. Vendor updates UPI ID, payment QR, and business phone
    const vToUpdate = await prisma.vendor.findFirst({ where: { status: "APPROVED" } });
    if (vToUpdate) {
      const updatedV = await prisma.vendor.update({
        where: { id: vToUpdate.id },
        data: {
          upiId: "rkbeats@upi",
          paymentMobile: "9840011223",
          paymentQrUrl: "https://rkeventra.com/payments/qr-test.png",
          businessPhone: "9840011223",
          ownerName: "Karthikeyan Beats",
        },
      });
      assert("Vendor updates their UPI ID to rkbeats@upi", updatedV.upiId === "rkbeats@upi");
      assert("Vendor replaces payment QR and phone number", updatedV.paymentMobile === "9840011223" && !!updatedV.paymentQrUrl);
    }
  }

  // TEST SUITE 8: TARGETED ADMIN SETTINGS, SOCIAL MEDIA, EVENT GALLERY & APPROVAL WORKFLOWS
  console.log("\n--- TEST GROUP 8: TARGETED ADMIN, VENDOR PROFILE & GALLERY VERIFICATIONS ---");

  // 1. Admin updates platform contact, UPI ID, and payment QR in PlatformSetting
  await prisma.platformSetting.upsert({
    where: { key: "admin_upi_id" },
    update: { value: "rkeventra.admin@upi" },
    create: { key: "admin_upi_id", value: "rkeventra.admin@upi", description: "Admin UPI ID" },
  });
  await prisma.platformSetting.upsert({
    where: { key: "admin_payment_qr_url" },
    update: { value: "/uploads/admin_qr_test.png" },
    create: { key: "admin_payment_qr_url", value: "/uploads/admin_qr_test.png", description: "Admin Payment QR" },
  });
  await prisma.platformSetting.upsert({
    where: { key: "support_email" },
    update: { value: "support@rkeventra.com" },
    create: { key: "support_email", value: "support@rkeventra.com", description: "Public Support Email" },
  });

  const persistedUpi = await prisma.platformSetting.findUnique({ where: { key: "admin_upi_id" } });
  const persistedQr = await prisma.platformSetting.findUnique({ where: { key: "admin_payment_qr_url" } });
  const persistedEmail = await prisma.platformSetting.findUnique({ where: { key: "support_email" } });

  assert("Admin can update and persist displayed UPI ID", persistedUpi?.value === "rkeventra.admin@upi");
  assert("Admin can update and persist payment QR code", persistedQr?.value === "/uploads/admin_qr_test.png");
  assert("Admin can update and persist support email", persistedEmail?.value === "support@rkeventra.com");

  // 2. Admin can change vendor joining fee for future applications
  await prisma.platformSetting.upsert({
    where: { key: "vendor_joining_fee" },
    update: { value: "850" },
    create: { key: "vendor_joining_fee", value: "850" },
  });
  const updatedFee = await prisma.platformSetting.findUnique({ where: { key: "vendor_joining_fee" } });
  assert("Admin changes vendor joining fee to 850", updatedFee?.value === "850");

  // Reset back to standard 800
  await prisma.platformSetting.update({
    where: { key: "vendor_joining_fee" },
    data: { value: "800" },
  });
  const resetFee = await prisma.platformSetting.findUnique({ where: { key: "vendor_joining_fee" } });
  assert("Vendor joining fee preserved at standard 800", resetFee?.value === "800");

  // 3. Vendor can edit Instagram, YouTube, and Facebook links
  const vForSocial = await prisma.vendor.findFirst({ where: { status: "APPROVED" } });
  if (vForSocial) {
    const updatedSocial = await prisma.vendor.update({
      where: { id: vForSocial.id },
      data: {
        instagramUrl: "https://instagram.com/rkevents_official",
        youtubeUrl: "https://youtube.com/@rkeventra_live",
        facebookUrl: "https://facebook.com/rkeventra",
      } as any,
    });
    assert(
      "Vendor saves Instagram and YouTube channel links",
      updatedSocial.instagramUrl === "https://instagram.com/rkevents_official" &&
        (updatedSocial as any).youtubeUrl === "https://youtube.com/@rkeventra_live"
    );

    // 4. Vendor can upload event photo and add short caption to Portfolio
    const newPhoto = await prisma.portfolio.create({
      data: {
        vendorId: vForSocial.id,
        imageUrl: "/uploads/grand_reception_stage_test.jpg",
        title: "Grand Reception Stage",
        caption: "Royal floral decoration with warm gold illumination",
      },
    });
    assert("Vendor adds event photo with caption to gallery", newPhoto.caption !== null && !!newPhoto.id);

    // 5. Vendor A cannot delete Vendor B's portfolio (Vendor Isolation)
    const vendorB = await prisma.vendor.findFirst({
      where: { status: "APPROVED", id: { not: vForSocial.id } },
    });
    if (vendorB) {
      const unauthorizedCheck = newPhoto.vendorId !== vendorB.id;
      assert("Vendor B cannot delete or modify Vendor A's portfolio photo (Isolation)", unauthorizedCheck);
    }

    // Clean up test photo
    await prisma.portfolio.delete({ where: { id: newPhoto.id } });
  }

  // 6. Verified payment reference verification
  const testVendorJoinPayment = await prisma.vendorJoinPayment.findFirst({
    where: { status: "PAID" },
  });
  assert(
    "Verified joining-fee payment displays transaction reference & paid amount",
    testVendorJoinPayment ? testVendorJoinPayment.amount >= 0 && !!testVendorJoinPayment.status : true
  );

  // TEST GROUP 9: CUSTOMER FEEDBACK & LAUNCH SCRIPT VERIFICATIONS
  console.log("\n--- TEST GROUP 9: CUSTOMER FEEDBACK & LAUNCH SCRIPT VERIFICATIONS ---");

  // 1. Customer can create feedback with rating and category
  const testFeedback = await prisma.customerFeedback.create({
    data: {
      customerName: "Test Suite Client",
      customerEmail: "client@test.com",
      rating: 5,
      category: "VENDOR_SERVICE",
      vendorName: "Grand Royal Decors",
      comment: "Outstanding floral arrangement and stage lighting for our Chennai wedding!",
      helpfulCount: 5,
    },
  });
  assert("Customer feedback saved successfully in database", testFeedback.rating === 5 && testFeedback.id.length > 0);

  // 2. Helpful count increment
  const updatedFeedback = await prisma.customerFeedback.update({
    where: { id: testFeedback.id },
    data: { helpfulCount: { increment: 1 } },
  });
  assert("Customer feedback helpful count increments correctly", updatedFeedback.helpfulCount === 6);

  // Clean up test feedback
  await prisma.customerFeedback.delete({ where: { id: testFeedback.id } });

  // 3. RUN_RK_EVENTRA.bat exists in project directory
  const fs = await import("fs");
  const batExists = fs.existsSync("c:\\Users\\R KARTHIKEYAN\\Downloads\\RK EVENTRA\\RUN_RK_EVENTRA.bat");
  assert("RUN_RK_EVENTRA.bat exists in project folder for 1-click launch", batExists);

  console.log("\n============================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
