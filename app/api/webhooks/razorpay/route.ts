import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(
  request: NextRequest
) {
  try {
    const secret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json(
        {
          error:
            "RAZORPAY_WEBHOOK_SECRET is not configured",
        },
        { status: 500 }
      );
    }

    const rawBody = await request.text();

    const signature =
      request.headers.get(
        "x-razorpay-signature"
      );

    if (!signature) {
      return NextResponse.json(
        {
          error: "Missing webhook signature",
        },
        { status: 400 }
      );
    }

    const expected =
      crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    const expectedBuffer =
      Buffer.from(expected);

    const receivedBuffer =
      Buffer.from(signature);

    if (
      expectedBuffer.length !==
        receivedBuffer.length ||
      !crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid webhook signature",
        },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);

    if (
      event.event === "payment.captured" ||
      event.event === "order.paid"
    ) {
      const paymentEntity =
        event.payload?.payment?.entity;

      const orderEntity =
        event.payload?.order?.entity;

      const paymentId =
        paymentEntity?.id || null;

      const orderId =
        paymentEntity?.order_id ||
        orderEntity?.id ||
        null;

      const amount =
        Number(
          paymentEntity?.amount ??
            orderEntity?.amount ??
            0
        );

      if (
        orderId &&
        paymentId &&
        amount > 0
      ) {
        /*
          Vendor joining payment
        */
        const joinPayment =
          await prisma.vendorJoinPayment.findUnique({
            where: {
              razorpayOrderId: orderId,
            },
          });

        if (joinPayment) {
          if (
            amount ===
            Math.round(
              Number(joinPayment.amount) * 100
            )
          ) {
            const paidAt = new Date();

            await prisma.$transaction(
              async (tx) => {
                await tx.vendorJoinPayment.update({
                  where: {
                    id: joinPayment.id,
                  },
                  data: {
                    status: "PAID",
                    razorpayPaymentId:
                      paymentId,
                    transactionId:
                      paymentId,
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
              }
            );
          }
        }

        /*
          Customer booking payment
        */
        const bookingPayment =
          await prisma.payment.findUnique({
            where: {
              razorpayOrderId: orderId,
            },
          });

        if (bookingPayment) {
          const expectedAmount =
            Math.round(
              Number(bookingPayment.amount) * 100
            );

          if (amount === expectedAmount) {
            const paidAt = new Date();

            await prisma.$transaction(
              async (tx) => {
                await tx.payment.update({
                  where: {
                    id: bookingPayment.id,
                  },
                  data: {
                    status: "PAID",
                    paymentMethod: "RAZORPAY",
                    razorpayPaymentId:
                      paymentId,
                    transactionId:
                      paymentId,
                    paidAt,
                  },
                });

                await tx.booking.update({
                  where: {
                    id: bookingPayment.bookingId,
                  },
                  data: {
                    status: "CONFIRMED",
                  },
                });
              }
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "RAZORPAY WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
