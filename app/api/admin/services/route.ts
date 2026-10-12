import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../src/lib/prisma";

async function requireAdmin() {
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
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, message: "Admin access required" },
      { status: 403 }
    );
  }

  return null;
}

export async function GET() {
  try {
    const authError = await requireAdmin();

    if (authError) return authError;

    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            status: true,
            location: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        bookingCount: service._count.bookings,
        vendor: service.vendor,
      })),
      count: services.length,
    });
  } catch (error) {
    console.error("ADMIN SERVICES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load services",
        services: [],
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authError = await requireAdmin();

    if (authError) return authError;

    const body = await request.json();
    const serviceId = body?.serviceId;

    if (!serviceId) {
      return NextResponse.json(
        { success: false, message: "serviceId is required" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("ADMIN SERVICE DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete service",
      },
      { status: 500 }
    );
  }
}
