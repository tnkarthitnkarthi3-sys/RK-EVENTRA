import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../src/lib/prisma";

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

type BookingStatus =
  (typeof allowedStatuses)[number];

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();

    const userId = cookieStore.get("rk_user_id")?.value;
    const role = cookieStore.get("rk_user_role")?.value;

    if (!userId || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    if (
      role !== "ADMIN" &&
      role !== "VENDOR" &&
      role !== "CUSTOMER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized role",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const bookingId =
      typeof body?.bookingId === "string"
        ? body.bookingId.trim()
        : "";

    const status =
      typeof body?.status === "string"
        ? body.status.trim().toUpperCase()
        : "";

    if (!bookingId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID and status are required",
        },
        { status: 400 }
      );
    }

    if (
      !allowedStatuses.includes(
        status as BookingStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking status",
        },
        { status: 400 }
      );
    }

    const booking =
      await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },

        include: {
          payment: true,
          vendor: true,
        },
      });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    const newStatus =
      status as BookingStatus;

    if (role === "CUSTOMER") {
      if (booking.customerId !== userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Booking access denied",
          },
          { status: 403 }
        );
      }

      if (newStatus !== "CANCELLED") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Customers can only cancel their own booking",
          },
          { status: 403 }
        );
      }
    }

    if (role === "VENDOR") {
      if (booking.vendor.userId !== userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Booking access denied",
          },
          { status: 403 }
        );
      }

      if (
        newStatus !== "CONFIRMED" &&
        newStatus !== "CANCELLED" &&
        newStatus !== "COMPLETED"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Vendor cannot set this status",
          },
          { status: 403 }
        );
      }
    }

    if (role === "ADMIN") {
      // Admin is allowed to manage booking lifecycle.
    }

    if (
      booking.status === "COMPLETED" &&
      newStatus !== "COMPLETED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Completed bookings cannot be reopened",
        },
        { status: 409 }
      );
    }

    if (
      booking.status === "CANCELLED" &&
      newStatus !== "CANCELLED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cancelled bookings cannot be reopened",
        },
        { status: 409 }
      );
    }

    if (
      newStatus === "CONFIRMED" &&
      booking.payment?.status !== "PAID"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking must be paid before confirmation",
        },
        { status: 409 }
      );
    }

    const updated =
      await prisma.booking.update({
        where: {
          id: bookingId,
        },

        data: {
          status: newStatus,
        },

        include: {
          payment: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          vendor: {
            select: {
              id: true,
              businessName: true,
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

    return NextResponse.json({
      success: true,
      message:
        "Booking status updated successfully",
      booking: updated,
    });
  } catch (error) {
    console.error("BOOKING STATUS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update booking status",
      },
      { status: 500 }
    );
  }
}
