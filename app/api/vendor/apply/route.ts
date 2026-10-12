import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Please sign in to submit a vendor application." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      businessName,
      description,
      location,
      phone,
      category,
      serviceName,
      servicePrice,
      serviceDescription,
      packageFeatures,
      idDocumentUrl,
    } = body;

    if (!businessName || !location || !category || !serviceName || !servicePrice) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required vendor application fields." },
        { status: 400 }
      );
    }

    // 1. Create or update vendor profile
    let vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (vendor) {
      vendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          businessName: businessName.trim(),
          description: description?.trim() || null,
          location: location.trim(),
          status: "PAYMENT_PENDING",
        },
      });
    } else {
      vendor = await prisma.vendor.create({
        data: {
          userId,
          businessName: businessName.trim(),
          description: description?.trim() || null,
          location: location.trim(),
          status: "PAYMENT_PENDING",
        },
      });
    }

    // Update user role to VENDOR if not already
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: "VENDOR",
        ...(phone ? { phone: phone.trim() } : {}),
      },
    });

    // 2. Create initial service
    const service = await prisma.service.create({
      data: {
        vendorId: vendor.id,
        name: serviceName.trim(),
        category: category.trim(),
        price: parseFloat(servicePrice),
        description: serviceDescription?.trim() || "Initial service package.",
        active: true,
      },
    });

    // 3. Create initial package
    await prisma.servicePackage.create({
      data: {
        serviceId: service.id,
        name: "Standard Package",
        price: parseFloat(servicePrice),
        description: serviceDescription?.trim() || "Complete standard service.",
        features: packageFeatures?.trim() || "Complete event setup and on-time service.",
        active: true,
      },
    });

    // 4. Attach verification document if provided
    if (idDocumentUrl) {
      await prisma.vendorDocument.create({
        data: {
          vendorId: vendor.id,
          docType: "GOVERNMENT_ID",
          fileName: "Government ID / Business Proof",
          fileUrl: idDocumentUrl,
          status: "PENDING",
        },
      });
    }

    // 5. Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: "VENDOR_APPLICATION_SUBMITTED",
        resource: `Vendor:${vendor.id}`,
        details: `Vendor applied with business name '${vendor.businessName}' in ${vendor.location}`,
      },
    });

    return NextResponse.json({
      success: true,
      vendorId: vendor.id,
      message: "Application submitted. Please proceed to ₹800 joining fee payment.",
    });
  } catch (error) {
    console.error("Vendor application error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit application",
      },
      { status: 500 }
    );
  }
}
