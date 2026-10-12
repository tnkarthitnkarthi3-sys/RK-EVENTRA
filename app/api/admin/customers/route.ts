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
    select: { id: true, role: true },
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

    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    const formatted = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      bookingCount: customer._count.bookings,
      reviewCount: customer._count.reviews,
    }));

    return NextResponse.json({
      success: true,
      customers: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error("ADMIN CUSTOMERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load customers",
        customers: [],
      },
      { status: 500 }
    );
  }
}
