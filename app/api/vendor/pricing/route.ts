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

    const services = await prisma.service.findMany({
      where: { vendorId: user.vendor!.id },
      include: {
        packages: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      vendor: user.vendor,
      services,
    });
  } catch (error) {
    console.error("VENDOR PRICING GET ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to load vendor pricing" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getVendorUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Vendor access required" }, { status: 403 });
    }

    const body = await request.json();
    const { action, packageId, serviceId, data } = body;

    // Security check: Verify serviceId belongs to vendor
    if (serviceId) {
      const s = await prisma.service.findFirst({
        where: { id: serviceId, vendorId: user.vendor!.id },
      });
      if (!s) {
        return NextResponse.json({ success: false, message: "Service not found or unauthorized" }, { status: 403 });
      }
    }

    // Security check: Verify packageId belongs to vendor's service
    if (packageId) {
      const p = await prisma.servicePackage.findUnique({
        where: { id: packageId },
        include: { service: true },
      });
      if (!p || p.service.vendorId !== user.vendor!.id) {
        return NextResponse.json({ success: false, message: "Package not found or unauthorized. Vendor isolation enforced." }, { status: 403 });
      }
    }

    const {
      name,
      description,
      basePrice,
      discountAmount = 0,
      discountPercent = 0,
      travelCharge = 0,
      addOnsJson = "[]",
      features = "",
      isPopular = false,
      active = true,
    } = data || {};

    const numBase = Number(basePrice);
    if (isNaN(numBase) || numBase < 0) {
      return NextResponse.json({ success: false, message: "Valid positive base price is required" }, { status: 400 });
    }

    const effectiveDiscount = discountAmount > 0 ? discountAmount : (numBase * Number(discountPercent || 0)) / 100;
    const displayPrice = Math.max(0, numBase - effectiveDiscount);
    const estimatedTotal = displayPrice + Number(travelCharge || 0);

    let pkg;
    if (action === "UPDATE_PACKAGE" && packageId) {
      pkg = await prisma.servicePackage.update({
        where: { id: packageId },
        data: {
          name: name ? String(name).trim() : undefined,
          description: description !== undefined ? String(description).trim() : undefined,
          price: displayPrice,
          basePrice: numBase,
          discountAmount: Number(discountAmount),
          discountPercent: Number(discountPercent),
          travelCharge: Number(travelCharge),
          addOnsJson: typeof addOnsJson === "string" ? addOnsJson : JSON.stringify(addOnsJson),
          features: typeof features === "string" ? features : JSON.stringify(features),
          isPopular: Boolean(isPopular),
          active: Boolean(active),
          estimatedTotal,
          lastModifiedRole: "VENDOR",
        },
      });

      // Update base service price if this package is lowest or primary
      await prisma.service.update({
        where: { id: pkg.serviceId },
        data: { price: displayPrice },
      });
    } else if (action === "CREATE_PACKAGE" && serviceId) {
      pkg = await prisma.servicePackage.create({
        data: {
          serviceId,
          name: String(name || "Custom Package").trim(),
          description: description ? String(description).trim() : "",
          price: displayPrice,
          basePrice: numBase,
          discountAmount: Number(discountAmount),
          discountPercent: Number(discountPercent),
          travelCharge: Number(travelCharge),
          addOnsJson: typeof addOnsJson === "string" ? addOnsJson : JSON.stringify(addOnsJson),
          features: typeof features === "string" ? features : JSON.stringify(features),
          isPopular: Boolean(isPopular),
          active: Boolean(active),
          estimatedTotal,
          lastModifiedRole: "VENDOR",
        },
      });
    } else {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Package pricing saved successfully",
      package: pkg,
    });
  } catch (error) {
    console.error("VENDOR PRICING POST ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to save vendor pricing" }, { status: 500 });
  }
}
