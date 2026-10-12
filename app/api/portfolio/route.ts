import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../src/lib/prisma";

async function getVendorId() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("rk_user_id")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      vendor: {
        select: { id: true },
      },
    },
  });

  if (!user || user.role !== "VENDOR" || !user.vendor) {
    return null;
  }

  return user.vendor.id;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    const id = vendorId || (await getVendorId());

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    const portfolios = await prisma.portfolio.findMany({
      where: {
        vendorId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      portfolios,
    });
  } catch (error) {
    console.error("PORTFOLIO GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load portfolio" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const vendorId = await getVendorId();

    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: "Vendor access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.imageUrl) {
      return NextResponse.json(
        { success: false, message: "imageUrl is required" },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        vendorId,
        imageUrl: String(body.imageUrl).trim(),
        title: body.title !== undefined ? String(body.title).trim() : null,
        caption: body.caption !== undefined ? String(body.caption).trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error("PORTFOLIO POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create portfolio item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const vendorId = await getVendorId();

    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: "Vendor access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, title, caption, imageUrl } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Photo ID is required" },
        { status: 400 }
      );
    }

    // Strict vendor isolation check
    const existing = await prisma.portfolio.findFirst({
      where: { id, vendorId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Portfolio item not found or unauthorized" },
        { status: 404 }
      );
    }

    const updated = await prisma.portfolio.update({
      where: { id },
      data: {
        title: title !== undefined ? String(title).trim() : undefined,
        caption: caption !== undefined ? String(caption).trim() : undefined,
        imageUrl: imageUrl !== undefined ? String(imageUrl).trim() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Portfolio item updated",
      portfolio: updated,
    });
  } catch (error) {
    console.error("PORTFOLIO PUT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update portfolio item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const vendorId = await getVendorId();

    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: "Vendor access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: body?.id,
        vendorId,
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { success: false, message: "Portfolio item not found" },
        { status: 404 }
      );
    }

    await prisma.portfolio.delete({
      where: {
        id: portfolio.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Portfolio item deleted",
    });
  } catch (error) {
    console.error("PORTFOLIO DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
