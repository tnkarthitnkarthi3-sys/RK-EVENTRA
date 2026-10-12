import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer ID is required",
        },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
  where: {
    customerId,
  },
  include: {
    vendor: {
      select: {
        id: true,
        businessName: true,
        location: true,
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
  orderBy: {
    createdAt: "desc",
  },
});

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("CUSTOMER BOOKINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}