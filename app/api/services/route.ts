import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../src/lib/prisma";

/* =========================================================
   VENDOR INCLUDE
========================================================= */

const vendorInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
};

/* =========================================================
   GET
   PUBLIC/CUSTOMER -> approved services
   ADMIN            -> all services
   VENDOR           -> own services
========================================================= */

export async function GET() {
  try {
    const cookieStore = await cookies();

    const userId = cookieStore.get("rk_user_id")?.value;

    /* =====================================================
       NOT LOGGED IN
       Public marketplace browsing
    ===================================================== */

    if (!userId) {
      const services = await prisma.service.findMany({
        where: {
          vendor: {
            status: "APPROVED",
          },
        },

        include: {
          vendor: {
            include: vendorInclude,
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        services,
      });
    }

    /* =====================================================
       FIND USER
    ===================================================== */

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        vendor: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       ADMIN
       Can see all services
    ===================================================== */

    if (user.role === "ADMIN") {
      const services = await prisma.service.findMany({
        include: {
          vendor: {
            include: vendorInclude,
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        services,
      });
    }

    /* =====================================================
       VENDOR
       Can see own services
    ===================================================== */

    if (user.role === "VENDOR" && user.vendor) {
      const services = await prisma.service.findMany({
        where: {
          vendorId: user.vendor.id,
        },

        include: {
          vendor: {
            include: vendorInclude,
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        services,
      });
    }

    /* =====================================================
       CUSTOMER
       Can browse approved vendor services
    ===================================================== */

    if (user.role === "CUSTOMER") {
      const services = await prisma.service.findMany({
        where: {
          vendor: {
            status: "APPROVED",
          },
        },

        include: {
          vendor: {
            include: vendorInclude,
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        services,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "You are not authorized to access services",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error("GET SERVICES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load services",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST / PUT / DELETE
   Keep your existing code below this point unchanged.
========================================================= */

