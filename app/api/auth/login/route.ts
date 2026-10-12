
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../src/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your email and password.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    if (user.role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          status: true,
        },
      });

      if (!vendor) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Vendor profile was not found. Please contact the administrator.",
          },
          { status: 403 }
        );
      }

      if (vendor.status === "REJECTED") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your vendor application has been rejected by the administrator.",
          },
          { status: 403 }
        );
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "rk_user_id",
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set({
      name: "rk_user_role",
      value: user.role,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong during login.",
      },
      { status: 500 }
    );
  }
}


