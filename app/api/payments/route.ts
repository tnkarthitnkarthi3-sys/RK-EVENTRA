import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { isRazorpayConfigured, razorpay } from "@/src/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message:
            "Payment gateway setup is incomplete. Please configure the server credentials before accepting payments.",
        },
        { status: 503 }
      );
    }

    const cookieStore = await cookies();

    const customerId =
      cookieStore.get("rk_user_id")?.value;

    const role =
      cookieStore.get("rk_user_role")?.value;

    if (!customerId || role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Customer login required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const bookingId =
      typeof body.bookingId === "string"
        ? body.bookingId.trim()
        : "";

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required",
        },
        { status: 400 }
      );
    }

    const customer = await prisma.user.findUnique({
      where: {
        id: customerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    if (!customer || customer.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          success: false,
          message: "Customer account not found",
        },
        { status: 403 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    if (booking.customerId !== customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot pay for this booking",
        },
        { status: 403 }
      );
    }

    if (booking.status === "CONFIRMED") {
      return NextResponse.json(
        {
          success: false,
          message: "Booking is already confirmed",
        },
        { status: 409 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: "This booking has been cancelled",
        },
        { status: 409 }
      );
    }

    const amount = Math.round(
      Number(booking.totalAmount) * 100
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking amount",
        },
        { status: 400 }
      );
    }

    /*
      If a Razorpay order already exists, reuse it.
    */

    if (
      booking.payment?.status === "PENDING" &&
      booking.payment.razorpayOrderId
    ) {
      return NextResponse.json({
        success: true,
        reused: true,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: booking.payment.razorpayOrderId,
        paymentRecordId: booking.payment.id,
        bookingId: booking.id,
        amount: Number(booking.totalAmount),
        currency: "INR",
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `booking_${booking.id}`,
      notes: {
        bookingId: booking.id,
        customerId,
        vendorId: booking.vendorId,
        serviceId: booking.serviceId,
        purpose: "RK EVENTRA Customer Booking",
      },
    });

    let payment;

    if (booking.payment) {
      payment = await prisma.payment.update({
        where: {
          id: booking.payment.id,
        },
        data: {
          amount: Number(booking.totalAmount),
          currency: "INR",
          status: "PENDING",
          razorpayOrderId: order.id,
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          customerId,
          amount: Number(booking.totalAmount),
          currency: "INR",
          status: "PENDING",
          razorpayOrderId: order.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      reused: false,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      paymentRecordId: payment.id,
      bookingId: booking.id,
      amount: Number(booking.totalAmount),
      currency: "INR",
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      vendor: booking.vendor.businessName,
      service: booking.service.name,
    });
  } catch (error) {
    console.error("CREATE PAYMENT ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create payment order",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();

    const customerId =
      cookieStore.get("rk_user_id")?.value;

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        booking: {
          include: {
            vendor: {
              select: {
                businessName: true,
              },
            },
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("GET PAYMENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load payments",
      },
      { status: 500 }
    );
  }
}
