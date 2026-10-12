import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    const reviews = await prisma.review.findMany({
      where: vendorId
        ? {
            booking: {
              vendorId,
            },
          }
        : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        booking: {
          select: {
            id: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("REVIEWS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load reviews",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Login required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only customers can create reviews",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const bookingId = body?.bookingId;
    const rating = Number(body?.rating);
    const comment =
      typeof body?.comment === "string"
        ? body.comment.trim()
        : null;

    if (!bookingId || !Number.isInteger(rating)) {
      return NextResponse.json(
        {
          success: false,
          message: "bookingId and rating are required",
        },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      select: {
        id: true,
        customerId: true,
        vendorId: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.customerId !== userId) {
      return NextResponse.json(
        { success: false, message: "Booking ownership mismatch" },
        { status: 403 }
      );
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          message: "Reviews are available after completion",
        },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        bookingId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "Review already exists",
        },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        customerId: userId,
        bookingId,
        rating,
        comment,
      },
    });

    const vendorReviews = await prisma.review.findMany({
      where: {
        booking: {
          vendorId: booking.vendorId,
        },
      },
      select: {
        rating: true,
      },
    });

    const average =
      vendorReviews.reduce(
        (sum, item) => sum + item.rating,
        0
      ) / vendorReviews.length;

    await prisma.vendor.update({
      where: {
        id: booking.vendorId,
      },
      data: {
        rating: Number(average.toFixed(1)),
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("REVIEW POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create review",
      },
      { status: 500 }
    );
  }
}
