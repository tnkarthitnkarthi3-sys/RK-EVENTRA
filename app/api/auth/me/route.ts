import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../src/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      const response = NextResponse.json(
        {
          success: false,
          message: "User session is no longer valid.",
        },
        { status: 401 }
      );

      response.cookies.delete("rk_user_id");
      response.cookies.delete("rk_user_role");
      return response;
    }

    const cookieRole = cookieStore.get("rk_user_role")?.value;

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

    if (cookieRole !== user.role) {
      response.cookies.set({
        name: "rk_user_role",
        value: user.role,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("AUTH ME GET ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify authentication.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    const updateData: {
      name?: string;
      phone?: string;
      password?: string;
    } = {};

    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }

    if (typeof phone === "string") {
      updateData.phone = phone.trim();
    }

    if (newPassword && typeof newPassword === "string") {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters." },
          { status: 400 }
        );
      }

      if (currentPassword) {
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
          return NextResponse.json(
            { success: false, message: "Current password does not match." },
            { status: 400 }
          );
        }
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile details updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("AUTH ME PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile details." },
      { status: 500 }
    );
  }
}
