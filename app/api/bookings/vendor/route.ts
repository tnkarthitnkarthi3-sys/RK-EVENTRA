import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Find vendor profile using logged-in user's ID
    const vendor = await prisma.vendor.findUnique({
      where: {
        userId,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vendor profile not found for this account. Please make sure this account is registered as a vendor.",
        },
        { status: 404 }
      );
    }

    // Get all bookings belonging to this vendor
    const bookings = await prisma.booking.findMany({
      where: {
        vendorId: vendor.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        service: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
          },
        },
      },
    });

    // Get services belonging to this vendor
    const services = await prisma.service.findMany({
      where: {
        vendorId: vendor.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,

      vendor: {
        id: vendor.id,
        businessName: vendor.businessName,
        location: vendor.location,
      },

      bookings,

      services,
    });
  } catch (error) {
    console.error("VENDOR DASHBOARD API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load vendor dashboard",
      },
      { status: 500 }
    );
  }
}