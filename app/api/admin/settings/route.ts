import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { isRazorpayConfigured } from "@/src/lib/razorpay";

async function getAdminUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("rk_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  return user?.role === "ADMIN" ? user : null;
}

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const [settings, auditLogs, latestSetting] = await Promise.all([
      prisma.platformSetting.findMany({ orderBy: { key: "asc" } }),
      prisma.auditLog.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true, role: true },
          },
        },
      }),
      prisma.platformSetting.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    // Default fallbacks if keys not yet in DB
    const mergedSettings: Record<string, string> = {
      admin_display_name: settingsMap.admin_display_name || "RK Eventra Admin",
      admin_contact_mobile: settingsMap.admin_contact_mobile || "+91 9840011223",
      support_email: settingsMap.support_email || "support@rkeventra.com",
      admin_upi_id: settingsMap.admin_upi_id || "7530041288@fam",
      admin_payment_qr_url: settingsMap.admin_payment_qr_url || "",
      platform_logo_url: settingsMap.platform_logo_url || "",
      support_contact_info: settingsMap.support_contact_info || "Mon - Sun: 9:00 AM - 9:00 PM IST",
      vendor_joining_fee: settingsMap.vendor_joining_fee || "800",
      admin_payment_instructions: settingsMap.admin_payment_instructions || "Send exact joining fee or booking deposit to admin UPI. Include vendor name in payment notes.",
      payment_gateway_status: isRazorpayConfigured() ? "ACTIVE" : "PENDING_CREDENTIALS",
      payment_gateway_provider: settingsMap.payment_gateway_provider || "Razorpay",
      payment_gateway_mode: settingsMap.payment_gateway_mode || "TEST",
      platform_commission_percent: settingsMap.platform_commission_percent || "10",
      gst_percent: settingsMap.gst_percent || "18",
      ...settingsMap,
    };

    return NextResponse.json({
      success: true,
      settings: mergedSettings,
      gatewayConfigured: isRazorpayConfigured(),
      lastUpdatedAt: latestSetting?.updatedAt || new Date().toISOString(),
      adminProfile: {
        id: admin.id,
        name: admin.name,
        email: admin.email, // Kept separate from public support email
      },
      auditLogs,
    });
  } catch (error) {
    console.error("ADMIN SETTINGS GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load platform settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { success: false, message: "Settings object is required" },
        { status: 400 }
      );
    }

    // Input Validation
    if (settings.support_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(settings.support_email).trim())) {
        return NextResponse.json(
          { success: false, message: "Invalid support email address format" },
          { status: 400 }
        );
      }
    }

    if (settings.admin_contact_mobile) {
      const phoneDigits = String(settings.admin_contact_mobile).replace(/[^0-9]/g, "");
      if (phoneDigits.length < 10) {
        return NextResponse.json(
          { success: false, message: "Admin mobile number must contain at least 10 digits" },
          { status: 400 }
        );
      }
    }

    if (settings.admin_upi_id) {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiRegex.test(String(settings.admin_upi_id).trim())) {
        return NextResponse.json(
          { success: false, message: "Invalid UPI ID format (e.g. name@bank or 9876543210@upi)" },
          { status: 400 }
        );
      }
    }

    if (settings.vendor_joining_fee !== undefined) {
      const feeNum = Number(settings.vendor_joining_fee);
      if (isNaN(feeNum) || feeNum < 0) {
        return NextResponse.json(
          { success: false, message: "Vendor joining fee must be a non-negative number" },
          { status: 400 }
        );
      }
    }

    // Persist to PlatformSetting securely without altering Admin login user record
    for (const [key, value] of Object.entries(settings)) {
      if (typeof key === "string" && value !== undefined) {
        await prisma.platformSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: {
            key,
            value: String(value),
            description: `Configured by admin ${admin.email}`,
          },
        });
      }
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        userEmail: admin.email,
        action: "UPDATE_PLATFORM_SETTINGS",
        resource: "PlatformSetting",
        details: JSON.stringify({
          updatedBy: admin.email,
          updatedKeys: Object.keys(settings),
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Platform settings updated and saved securely",
      lastUpdatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("ADMIN SETTINGS POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save settings" },
      { status: 500 }
    );
  }
}
