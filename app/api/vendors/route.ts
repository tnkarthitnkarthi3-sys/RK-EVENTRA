import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        status: "APPROVED",
      },
      orderBy: {
        createdAt: "desc",
      },
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
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error("PUBLIC VENDORS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load vendors",
        vendors: [],
      },
      { status: 500 }
    );
  }
}
