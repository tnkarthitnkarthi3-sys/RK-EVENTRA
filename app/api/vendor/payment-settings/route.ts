import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

async function getVendorUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("rk_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      vendor: true,
    },
  });

  if (!user || user.role !== "VENDOR" || !user.vendor) {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const user = await getVendorUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Vendor access required" }, { status: 403 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: user.vendor!.id },
      select: {
        id: true,
        businessName: true,
        upiId: true,
        paymentQrUrl: true,
        paymentMobile: true,
        paymentDisplayName: true,
        bankAccountDetails: true,
        paymentInstructions: true,
        showManualUpi: true,
        paymentSettingsUpdatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      settings: vendor,
    });
  } catch (error) {
    console.error("VENDOR PAYMENT SETTINGS GET ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to load payment settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getVendorUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Vendor access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      upiId,
      paymentQrUrl,
      paymentMobile,
      paymentDisplayName,
      bankAccountDetails,
      paymentInstructions,
      showManualUpi = true,
    } = body;

    // Validation
    const cleanUpi = upiId ? String(upiId).trim() : null;
    const cleanMobile = paymentMobile ? String(paymentMobile).trim() : null;
    const cleanDisplayName = paymentDisplayName ? String(paymentDisplayName).trim() : null;

    if (cleanUpi && !/^[\w.-]+@[\w.-]+$/.test(cleanUpi)) {
      return NextResponse.json({ success: false, message: "Invalid UPI ID format (e.g., name@upi or 9876543210@fam)" }, { status: 400 });
    }

    if (cleanMobile && !/^\+?[0-9]{10,14}$/.test(cleanMobile.replace(/\s+/g, ""))) {
      return NextResponse.json({ success: false, message: "Invalid payment mobile number" }, { status: 400 });
    }

    // Safe QR image validation if provided as data url or url
    let safeQrUrl = paymentQrUrl ? String(paymentQrUrl).trim() : null;
    if (safeQrUrl && !safeQrUrl.startsWith("http://") && !safeQrUrl.startsWith("https://") && !safeQrUrl.startsWith("data:image/") && !safeQrUrl.startsWith("/")) {
      return NextResponse.json({ success: false, message: "Invalid QR code format. Must be an image URL or uploaded file." }, { status: 400 });
    }

    const oldVendor = await prisma.vendor.findUnique({
      where: { id: user.vendor!.id },
      select: { upiId: true, paymentQrUrl: true, paymentMobile: true },
    });

    const updatedVendor = await prisma.vendor.update({
      where: { id: user.vendor!.id },
      data: {
        upiId: cleanUpi,
        paymentQrUrl: safeQrUrl,
        paymentMobile: cleanMobile,
        paymentDisplayName: cleanDisplayName,
        bankAccountDetails: bankAccountDetails ? String(bankAccountDetails).trim() : null,
        paymentInstructions: paymentInstructions ? String(paymentInstructions).trim() : null,
        showManualUpi: Boolean(showManualUpi),
        paymentSettingsUpdatedAt: new Date(),
      },
    });

    // Record audit log for financial compliance
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "UPDATE_VENDOR_PAYMENT_SETTINGS",
        resource: `Vendor:${user.vendor!.id}`,
        details: JSON.stringify({
          previousUpi: oldVendor?.upiId,
          newUpi: cleanUpi,
          hadQr: Boolean(oldVendor?.paymentQrUrl),
          newQrUploaded: Boolean(safeQrUrl),
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment and UPI settings updated successfully",
      settings: updatedVendor,
    });
  } catch (error) {
    console.error("VENDOR PAYMENT SETTINGS UPDATE ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to update payment settings" }, { status: 500 });
  }
}
