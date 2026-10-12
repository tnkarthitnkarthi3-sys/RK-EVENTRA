import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: "vendorId is required" },
        { status: 400 }
      );
    }

    const availability = await prisma.availability.findMany({
      where: {
        vendorId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      availability,
    });
  } catch (error) {
    console.error("AVAILABILITY GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load availability",
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

    const body = await request.json();

    if (!body.date) {
      return NextResponse.json(
        { success: false, message: "date is required" },
        { status: 400 }
      );
    }

    const date = new Date(body.date);

    date.setHours(0, 0, 0, 0);

    const availability = await prisma.availability.upsert({
      where: {
        vendorId_date: {
          vendorId: user.vendor.id,
          date,
        },
      },
      update: {
        available:
          typeof body.available === "boolean"
            ? body.available
            : true,
      },
      create: {
        vendorId: user.vendor.id,
        date,
        available:
          typeof body.available === "boolean"
            ? body.available
            : true,
      },
    });

    return NextResponse.json({
      success: true,
      availability,
    });
  } catch (error) {
    console.error("AVAILABILITY POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update availability",
      },
      { status: 500 }
    );
  }
}
