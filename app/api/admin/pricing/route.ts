import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

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
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const [categories, packages, settings] = await Promise.all([
      prisma.serviceCategory.findMany({
        orderBy: { displayOrder: "asc" },
      }),
      prisma.servicePackage.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              price: true,
              vendor: {
                select: {
                  id: true,
                  businessName: true,
                  location: true,
                },
              },
            },
          },
        },
      }),
      prisma.platformSetting.findMany(),
    ]);

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      categories,
      packages,
      platformSettings: {
        commissionPercent: Number(settingsMap["platform_commission_percent"] || 10),
        serviceFee: Number(settingsMap["platform_service_fee"] || 0),
        gstPercent: Number(settingsMap["gst_percent"] || 18),
        vendorJoiningFee: Number(settingsMap["vendor_joining_fee"] || 800),
      },
    });
  } catch (error) {
    console.error("ADMIN PRICING GET ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to load pricing data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { action, serviceId, packageId, categoryId, data } = body;

    // 1. UPDATE OR CREATE SERVICE PACKAGE
    if (action === "UPDATE_PACKAGE" || action === "CREATE_PACKAGE") {
      const {
        name,
        description,
        basePrice,
        discountAmount = 0,
        discountPercent = 0,
        travelCharge = 0,
        addOnsJson = "[]",
        isPopular = false,
        isFeaturedOnHome = false,
        active = true,
        isArchived = false,
        features = "",
      } = data;

      const numBase = Number(basePrice);
      if (isNaN(numBase) || numBase < 0) {
        return NextResponse.json({ success: false, message: "Valid positive base price is required" }, { status: 400 });
      }

      // Compute display price and estimated total with platform fee
      const effectiveDiscount = discountAmount > 0 ? discountAmount : (numBase * Number(discountPercent || 0)) / 100;
      const displayPrice = Math.max(0, numBase - effectiveDiscount);
      const estimatedTotal = displayPrice + Number(travelCharge || 0);

      let pkg;
      if (action === "UPDATE_PACKAGE" && packageId) {
        const oldPkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
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
            isFeaturedOnHome: Boolean(isFeaturedOnHome),
            active: Boolean(active),
            isArchived: Boolean(isArchived),
            estimatedTotal,
            lastModifiedByAdminId: admin.id,
            lastModifiedRole: "ADMIN",
          },
        });

        // Audit Log
        await prisma.auditLog.create({
          data: {
            userId: admin.id,
            userEmail: admin.email,
            action: "UPDATE_PACKAGE_PRICING",
            resource: `ServicePackage:${packageId}`,
            details: JSON.stringify({
              previousPrice: oldPkg?.price,
              newPrice: displayPrice,
              basePrice: numBase,
              discountAmount,
              travelCharge,
            }),
          },
        });
      } else {
        if (!serviceId) {
          return NextResponse.json({ success: false, message: "serviceId is required to create a package" }, { status: 400 });
        }
        pkg = await prisma.servicePackage.create({
          data: {
            serviceId,
            name: String(name || "New Package").trim(),
            description: description ? String(description).trim() : "",
            price: displayPrice,
            basePrice: numBase,
            discountAmount: Number(discountAmount),
            discountPercent: Number(discountPercent),
            travelCharge: Number(travelCharge),
            addOnsJson: typeof addOnsJson === "string" ? addOnsJson : JSON.stringify(addOnsJson),
            features: typeof features === "string" ? features : JSON.stringify(features),
            isPopular: Boolean(isPopular),
            isFeaturedOnHome: Boolean(isFeaturedOnHome),
            active: Boolean(active),
            isArchived: false,
            estimatedTotal,
            lastModifiedByAdminId: admin.id,
            lastModifiedRole: "ADMIN",
          },
        });
      }

      return NextResponse.json({ success: true, package: pkg, message: "Package price updated successfully" });
    }

    // 2. UPDATE SERVICE CATEGORY PRICING & VISIBILITY
    if (action === "UPDATE_CATEGORY" && categoryId) {
      const {
        name,
        description,
        defaultBasePrice,
        minPrice,
        maxPrice,
        active,
        isArchived,
        displayOrder,
      } = data;

      const updatedCat = await prisma.serviceCategory.update({
        where: { id: categoryId },
        data: {
          name: name ? String(name).trim() : undefined,
          description: description !== undefined ? String(description).trim() : undefined,
          defaultBasePrice: defaultBasePrice !== undefined ? Number(defaultBasePrice) : undefined,
          minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
          active: active !== undefined ? Boolean(active) : undefined,
          isArchived: isArchived !== undefined ? Boolean(isArchived) : undefined,
          displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          userEmail: admin.email,
          action: "UPDATE_CATEGORY_PRICING",
          resource: `ServiceCategory:${categoryId}`,
          details: JSON.stringify({ defaultBasePrice, minPrice, maxPrice, active }),
        },
      });

      return NextResponse.json({ success: true, category: updatedCat, message: "Category pricing updated successfully" });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("ADMIN PRICING POST ERROR:", error);
    return NextResponse.json({ success: false, message: "Pricing operation failed" }, { status: 500 });
  }
}
