import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

function setAuthCookies(
  response: NextResponse,
  userId: string,
  role: string
) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };

  response.cookies.set({
    name: "rk_user_id",
    value: userId,
    ...cookieOptions,
  });

  response.cookies.set({
    name: "rk_user_role",
    value: role,
    ...cookieOptions,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const phone = String(body.phone || "").trim();

    const password = String(body.password || "");

    const requestedRole = String(
      body.role || "CUSTOMER"
    ).toUpperCase();

    const businessName =
      String(body.businessName || "").trim();

    const location =
      String(body.location || "").trim();

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (roleIsVendor(requestedRole) && !businessName) {
      return NextResponse.json(
        {
          success: false,
          message: "Business name is required for vendor registration.",
        },
        { status: 400 }
      );
    }

    // Only CUSTOMER or VENDOR can register.
    // ADMIN must be created separately.
    const role =
      requestedRole === "VENDOR"
        ? "VENDOR"
        : "CUSTOMER";

    // -----------------------------------------
    // CHECK EXISTING USER
    // -----------------------------------------

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // -----------------------------------------
    // HASH PASSWORD
    // -----------------------------------------

    const hashedPassword =
      await bcrypt.hash(password, 12);

    // -----------------------------------------
    // CUSTOMER REGISTER
    // -----------------------------------------

    if (role === "CUSTOMER") {
      const customer =
        await prisma.user.create({
          data: {
            name,
            email,
            phone: phone || null,
            password: hashedPassword,
            role: "CUSTOMER",
          },

          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
          },
        });

      const response = NextResponse.json(
        {
          success: true,
          message:
            "Customer account created successfully.",
          user: customer,
        },
        { status: 201 }
      );

      setAuthCookies(
        response,
        customer.id,
        customer.role
      );

      return response;
    }

    // -----------------------------------------
    // VENDOR REGISTER
    // -----------------------------------------

    const vendorUser =
      await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role: "VENDOR",

          vendor: {
            create: {
              businessName:
                businessName || name,

              description:
                "New event service provider",

              location:
                location || null,

              rating: 0,

              status: "PENDING",

              approvedAt: null,
            },
          },
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,

          vendor: {
            select: {
              id: true,
              businessName: true,
              description: true,
              location: true,
              rating: true,
              status: true,
              approvedAt: true,
              joinedAt: true,
            },
          },
        },
      });

    // -----------------------------------------
    // VENDOR RESPONSE
    // -----------------------------------------

    const response = NextResponse.json(
      {
        success: true,
        message:
          "Vendor account created successfully. Continue with the ₹800 joining fee.",

        user: vendorUser,

        vendorStatus:
          vendorUser.vendor?.status || "PENDING",
      },
      { status: 201 }
    );

    // Automatically authenticate newly registered vendor.
    setAuthCookies(
      response,
      vendorUser.id,
      vendorUser.role
    );

    return response;
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create account. Please try again.",
      },
      { status: 500 }
    );
  }
}

function roleIsVendor(role: string) {
  return role === "VENDOR";
}
