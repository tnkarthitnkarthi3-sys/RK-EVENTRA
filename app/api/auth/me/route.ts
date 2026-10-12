
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../src/lib/prisma";

export async function GET() {
  try {
    // =====================================================
    // 1. GET LOGIN COOKIE
    // =====================================================

    const cookieStore = await cookies();

    const userId = cookieStore.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // 2. FIND USER
    // =====================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,

        vendor: {
          select: {
            id: true,
            status: true,
            approvedAt: true,
          },
        },
      },
    });

    // =====================================================
    // 3. INVALID COOKIE
    // =====================================================

    if (!user) {
      const response = NextResponse.json(
        {
          success: false,
          message: "User session is no longer valid.",
        },
        {
          status: 401,
        }
      );

      response.cookies.delete("rk_user_id");
      response.cookies.delete("rk_user_role");

      return response;
    }

    // =====================================================
    // 4. CHECK ROLE COOKIE
    // =====================================================

    const cookieRole =
      cookieStore.get("rk_user_role")?.value;

    // =====================================================
    // 5. RESPONSE
    // =====================================================

    const response = NextResponse.json({
      success: true,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,

        vendor: user.vendor
          ? {
              id: user.vendor.id,
              status: user.vendor.status,
              approvedAt: user.vendor.approvedAt,
            }
          : null,
      },
    });

    // =====================================================
    // 6. REFRESH ROLE COOKIE
    // =====================================================

    if (cookieRole !== user.role) {
      response.cookies.set({
        name: "rk_user_role",
        value: user.role,
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error(
      "AUTH ME ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify authentication.",
      },
      {
        status: 500,
      }
    );
  }
}

