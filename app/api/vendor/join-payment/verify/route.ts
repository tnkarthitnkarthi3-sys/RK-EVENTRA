import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { razorpay } from "@/src/lib/razorpay";

const JOIN_FEE = 800;

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const orderId =
      typeof body.orderId === "string" ? body.orderId.trim() : "";

    const paymentId =
      typeof body.paymentId === "string" ? body.paymentId.trim() : "";

    const signature =
      typeof body.signature === "string" ? body.signature.trim() : "";

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Invalid Razorpay payment data" },
        { status: 400 }
      );
    }

    const joinPayment = await prisma.vendorJoinPayment.findFirst({
      where: {
        userId,
        razorpayOrderId: orderId,
      },
      include: {
        vendor: true,
      },
    });

    if (!joinPayment) {
      return NextResponse.json(
        { error: "Payment order not found" },
        { status: 404 }
      );
    }

    if (joinPayment.amount !== JOIN_FEE) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    if (joinPayment.status === "PAID") {
      return NextResponse.json({
        success: true,
        paid: true,
        alreadyPaid: true,
        paymentId: joinPayment.razorpayPaymentId,
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return NextResponse.json(
        { error: "Invalid Razorpay signature" },
        { status: 400 }
      );
    }

    const razorpayOrder = await razorpay.orders.fetch(orderId);
    const razorpayPayment = await razorpay.payments.fetch(paymentId);

    const orderAmount = Number(razorpayOrder.amount);
    const paymentAmount = Number(razorpayPayment.amount);

    if (orderAmount !== JOIN_FEE * 100) {
      return NextResponse.json(
        { error: "Razorpay order amount mismatch" },
        { status: 400 }
      );
    }

    if (paymentAmount !== JOIN_FEE * 100) {
      return NextResponse.json(
        { error: "Razorpay payment amount mismatch" },
        { status: 400 }
      );
    }

    if (razorpayPayment.order_id !== orderId) {
      return NextResponse.json(
        { error: "Payment does not belong to this order" },
        { status: 400 }
      );
    }

    if (razorpayPayment.status !== "captured") {
      return NextResponse.json(
        {
          error: "Payment has not been captured by Razorpay",
          paymentStatus: razorpayPayment.status,
        },
        { status: 400 }
      );
    }

    const paidAt = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.vendorJoinPayment.update({
        where: {
          id: joinPayment.id,
        },
        data: {
          status: "PAID",
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          transactionId: paymentId,
          paidAt,
        },
      });

      await tx.vendor.update({
        where: {
          id: joinPayment.vendorId,
        },
        data: {
          status: "APPROVED",
          approvedAt: paidAt,
        },
      });

      return result;
    });

    return NextResponse.json({
      success: true,
      paid: true,
      paymentId: updated.razorpayPaymentId,
      orderId: updated.razorpayOrderId,
      amount: updated.amount,
      currency: updated.currency,
      paidAt: updated.paidAt,
    });
  } catch (error) {
    console.error("Vendor join payment verification error:", error);

    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}

