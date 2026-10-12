import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/src/lib/prisma";
import { razorpay } from "@/src/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
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

    const orderId =
      typeof body.razorpay_order_id === "string"
        ? body.razorpay_order_id.trim()
        : "";

    const paymentId =
      typeof body.razorpay_payment_id === "string"
        ? body.razorpay_payment_id.trim()
        : "";

    const signature =
      typeof body.razorpay_signature === "string"
        ? body.razorpay_signature.trim()
        : "";

    if (
      !bookingId ||
      !orderId ||
      !paymentId ||
      !signature
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Incomplete Razorpay payment response",
        },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: {
        razorpayOrderId: orderId,
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment record not found",
        },
        { status: 404 }
      );
    }

    if (payment.bookingId !== bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking/payment mismatch",
        },
        { status: 400 }
      );
    }

    if (payment.customerId !== customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment ownership mismatch",
        },
        { status: 403 }
      );
    }

    if (payment.status === "PAID") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        bookingId,
        paymentId: payment.razorpayPaymentId,
      });
    }

    /*
      -----------------------------------------------------
      RAZORPAY SIGNATURE VERIFICATION
      -----------------------------------------------------
    */

    const secret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET is not configured"
      );
    }

    const expectedSignature =
      crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    const signaturesMatch =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );

    if (!signaturesMatch) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "FAILED",
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Invalid Razorpay payment signature",
        },
        { status: 400 }
      );
    }

    /*
      -----------------------------------------------------
      FETCH PAYMENT FROM RAZORPAY
      -----------------------------------------------------
    */

    const razorpayPayment =
      await razorpay.payments.fetch(paymentId);

    const razorpayOrder =
      await razorpay.orders.fetch(orderId);

    const expectedAmount =
      Math.round(Number(payment.amount) * 100);

    const actualAmount =
      Number(razorpayPayment.amount);

    if (actualAmount !== expectedAmount) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment amount mismatch",
        },
        { status: 400 }
      );
    }

    if (razorpayPayment.order_id !== orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay order mismatch",
        },
        { status: 400 }
      );
    }

    if (Number(razorpayOrder.amount) !== expectedAmount) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay order amount mismatch",
        },
        { status: 400 }
      );
    }

    if (razorpayPayment.status !== "captured") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment is not captured yet. Please wait and try again.",
        },
        { status: 409 }
      );
    }

    /*
      -----------------------------------------------------
      CONFIRM PAYMENT + BOOKING
      -----------------------------------------------------
    */

    const result = await prisma.$transaction(
      async (tx) => {
        const freshPayment =
          await tx.payment.findUnique({
            where: {
              id: payment.id,
            },
            include: {
              booking: true,
            },
          });

        if (!freshPayment) {
          throw new Error("Payment record disappeared");
        }

        if (freshPayment.status === "PAID") {
          return {
            alreadyPaid: true,
          };
        }

        const booking = freshPayment.booking;

        const dayStart = new Date(booking.eventDate);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const conflictingBooking =
          await tx.booking.findFirst({
            where: {
              vendorId: booking.vendorId,
              eventDate: {
                gte: dayStart,
                lte: dayEnd,
              },
              status: {
                in: ["CONFIRMED"],
              },
              id: {
                not: booking.id,
              },
            },
            select: {
              id: true,
            },
          });

        if (conflictingBooking) {
          throw new Error(
            "This vendor is already booked for the selected date."
          );
        }

        await tx.booking.update({
          where: {
            id: booking.id,
          },
          data: {
            status: "CONFIRMED",
          },
        });

        const updatedPayment =
          await tx.payment.update({
            where: {
              id: freshPayment.id,
            },
            data: {
              status: "PAID",
              paymentMethod:
                razorpayPayment.method || null,
              razorpayPaymentId: paymentId,
              razorpaySignature: signature,
              transactionId: paymentId,
              paidAt: new Date(),
            },
          });

        return {
          alreadyPaid: false,
          booking,
          payment: updatedPayment,
        };
      }
    );

    return NextResponse.json({
      success: true,
      alreadyPaid: result.alreadyPaid,
      bookingId,
      paymentId,
      status: "PAID",
      bookingStatus: "CONFIRMED",
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed",
      },
      { status: 500 }
    );
  }
}

