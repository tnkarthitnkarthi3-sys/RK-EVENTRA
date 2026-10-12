import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    const [
      vendors,
      services,
      customers,
      bookings,
    ] = await Promise.all([
      prisma.vendor.count(),

      prisma.service.count(),

      prisma.user.count({
        where: {
          role: "CUSTOMER",
        },
      }),

      prisma.booking.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        vendors,
        services,
        customers,
        bookings,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admin statistics",
      },
      {
        status: 500,
      }
    );
  }
}
