import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../src/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function requireAdmin() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("rk_user_id")?.value;

  if (!userId) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const vendor = await prisma.vendor.findUnique({
      where: {
        id,
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
          include: {
            packages: {
              where: {
                active: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        portfolios: {
          orderBy: {
            createdAt: "desc",
          },
        },
        charges: {
          where: {
            active: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      vendor,
      services: vendor.services,
      portfolios: vendor.portfolios,
    });
  } catch (error) {
    console.error("VENDOR GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load vendor",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireAdmin();

    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await context.params;

    const vendor = await prisma.vendor.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        businessName: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor not found",
        },
        { status: 404 }
      );
    }

    await prisma.vendor.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Vendor "${vendor.businessName}" deleted successfully`,
    });
  } catch (error) {
    console.error("VENDOR DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete vendor",
      },
      { status: 500 }
    );
  }
}
