import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../src/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        vendor: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user || user.role !== "VENDOR" || !user.vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor access required" },
        { status: 403 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        vendorId: user.vendor.id,
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        serviceAmount: true,
        createdAt: true,
        eventDate: true,
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const completed = bookings.filter(
      (booking) => booking.status === "COMPLETED"
    );

    const confirmed = bookings.filter(
      (booking) => booking.status === "CONFIRMED"
    );

    const pending = bookings.filter(
      (booking) => booking.status === "PENDING"
    );

    const totalRevenue = completed.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    const confirmedRevenue = confirmed.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    const pendingRevenue = pending.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        confirmedRevenue,
        pendingRevenue,
        completedBookings: completed.length,
        confirmedBookings: confirmed.length,
        pendingBookings: pending.length,
        totalBookings: bookings.length,
      },
      bookings,
    });
  } catch (error) {
    console.error("VENDOR EARNINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load earnings",
      },
      { status: 500 }
    );
  }
}
