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
      return NextResponse.json(
        { success: false, message: "Vendor access required" },
        { status: 403 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: user.vendor!.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: {
          include: {
            packages: true,
          },
          orderBy: { createdAt: "desc" },
        },
        portfolios: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            services: true,
            bookings: true,
            portfolios: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      vendor,
    });
  } catch (error) {
    console.error("VENDOR PROFILE GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getVendorUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Vendor access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      businessName,
      description,
      location,
      ownerName,
      contactEmail,
      businessPhone,
      whatsappNumber,
      fullAddress,
      yearsOfExperience,
      serviceArea,
      openingHours,
      websiteUrl,
      instagramUrl,
      youtubeUrl,
      facebookUrl,
      cancellationPolicy,
      profileImage,
      upiId,
      paymentQrUrl,
      paymentMobile,
      paymentDisplayName,
      paymentInstructions,
      showManualUpi,
      name,
      phone,
    } = body;

    // URL Validation helpers
    function isValidWebUrl(url?: string | null): boolean {
      if (!url) return true;
      const clean = url.trim();
      return clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("//");
    }

    if (websiteUrl && !isValidWebUrl(websiteUrl)) {
      return NextResponse.json(
        { success: false, message: "Website URL must begin with https:// or http://" },
        { status: 400 }
      );
    }

    if (youtubeUrl && !isValidWebUrl(youtubeUrl)) {
      return NextResponse.json(
        { success: false, message: "YouTube channel URL must begin with https:// or http://" },
        { status: 400 }
      );
    }

    if (facebookUrl && !isValidWebUrl(facebookUrl)) {
      return NextResponse.json(
        { success: false, message: "Facebook page URL must begin with https:// or http://" },
        { status: 400 }
      );
    }

    // Strict Vendor Isolation: Always update ONLY user.vendor!.id
    const vendor = await prisma.vendor.update({
      where: {
        id: user.vendor!.id,
      },
      data: {
        businessName: typeof businessName === "string" ? businessName.trim() : undefined,
        description: typeof description === "string" ? description.trim() : undefined,
        location: typeof location === "string" ? location.trim() : undefined,
        ownerName: typeof ownerName === "string" ? ownerName.trim() : undefined,
        contactEmail: typeof contactEmail === "string" ? contactEmail.trim() : undefined,
        businessPhone: typeof businessPhone === "string" ? businessPhone.trim() : undefined,
        whatsappNumber: typeof whatsappNumber === "string" ? whatsappNumber.trim() : undefined,
        fullAddress: typeof fullAddress === "string" ? fullAddress.trim() : undefined,
        yearsOfExperience: yearsOfExperience !== undefined ? Number(yearsOfExperience) : undefined,
        serviceArea: typeof serviceArea === "string" ? serviceArea.trim() : undefined,
        openingHours: typeof openingHours === "string" ? openingHours.trim() : undefined,
        websiteUrl: typeof websiteUrl === "string" ? websiteUrl.trim() : undefined,
        instagramUrl: typeof instagramUrl === "string" ? instagramUrl.trim() : undefined,
        youtubeUrl: typeof youtubeUrl === "string" ? youtubeUrl.trim() : undefined,
        facebookUrl: typeof facebookUrl === "string" ? facebookUrl.trim() : undefined,
        cancellationPolicy: typeof cancellationPolicy === "string" ? cancellationPolicy.trim() : undefined,
        profileImage: typeof profileImage === "string" ? profileImage.trim() : undefined,
        upiId: typeof upiId === "string" ? upiId.trim() : undefined,
        paymentQrUrl: typeof paymentQrUrl === "string" ? paymentQrUrl.trim() : undefined,
        paymentMobile: typeof paymentMobile === "string" ? paymentMobile.trim() : undefined,
        paymentDisplayName: typeof paymentDisplayName === "string" ? paymentDisplayName.trim() : undefined,
        paymentInstructions: typeof paymentInstructions === "string" ? paymentInstructions.trim() : undefined,
        showManualUpi: typeof showManualUpi === "boolean" ? showManualUpi : undefined,
      } as any,
    });

    if (typeof name === "string" || typeof phone === "string") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: typeof name === "string" ? name.trim() : undefined,
          phone: typeof phone === "string" ? phone.trim() : undefined,
        },
      });
    }

    // Record Audit Log for Vendor Profile Edit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "UPDATE_VENDOR_PROFILE",
        resource: "Vendor",
        details: JSON.stringify({
          vendorId: user.vendor!.id,
          businessName,
          location,
          businessPhone,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Vendor profile updated successfully",
      vendor,
    });
  } catch (error) {
    console.error("VENDOR PROFILE UPDATE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
