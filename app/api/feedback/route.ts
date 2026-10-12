import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const ratingParam = searchParams.get("rating");

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (ratingParam && !isNaN(Number(ratingParam))) {
      where.rating = Number(ratingParam);
    }

    const [feedbacks, totalCount, ratingStats] = await Promise.all([
      prisma.customerFeedback.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 50,
      }),
      prisma.customerFeedback.count(),
      prisma.customerFeedback.groupBy({
        by: ["rating"],
        _count: { rating: true },
      }),
    ]);

    // Calculate average rating
    const allForAvg = await prisma.customerFeedback.findMany({
      select: { rating: true },
    });
    const avgRating =
      allForAvg.length > 0
        ? Number(
            (
              allForAvg.reduce((sum, item) => sum + item.rating, 0) /
              allForAvg.length
            ).toFixed(1)
          )
        : 5.0;

    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingStats.forEach((r) => {
      breakdown[r.rating] = r._count.rating;
    });

    return NextResponse.json({
      success: true,
      feedbacks,
      stats: {
        totalCount,
        avgRating,
        breakdown,
      },
    });
  } catch (error) {
    console.error("FEEDBACK GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load customer feedbacks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("rk_user_id")?.value;

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });
    }

    const body = await request.json();
    const rating = Math.max(1, Math.min(5, Number(body?.rating) || 5));
    const customerName = (body?.customerName || user?.name || "Verified Customer").trim();
    const customerEmail = (body?.customerEmail || user?.email || null)?.trim();
    const category = (body?.category || "PLATFORM").toUpperCase();
    const vendorName = body?.vendorName ? String(body.vendorName).trim() : null;
    const comment = String(body?.comment || "").trim();

    if (!comment || comment.length < 5) {
      return NextResponse.json(
        { success: false, message: "Please provide a detailed feedback comment (minimum 5 characters)" },
        { status: 400 }
      );
    }

    const newFeedback = await prisma.customerFeedback.create({
      data: {
        userId: user?.id || null,
        customerName,
        customerEmail,
        rating,
        category,
        vendorName,
        comment,
        isFeatured: rating >= 4,
        helpfulCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your valuable feedback!",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("FEEDBACK POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit customer feedback" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const feedbackId = body?.feedbackId;

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, message: "feedbackId is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.customerFeedback.update({
      where: { id: feedbackId },
      data: {
        helpfulCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      helpfulCount: updated.helpfulCount,
    });
  } catch (error) {
    console.error("FEEDBACK PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update feedback" },
      { status: 500 }
    );
  }
}
