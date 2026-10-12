import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("rk_user_id")?.value;
    const role = request.cookies.get("rk_user_role")?.value;

    if (!userId || role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const [bookingPayments, vendorJoinPayments] =
      await Promise.all([
        prisma.payment.findMany({
          orderBy: {
            createdAt: "desc",
          },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            booking: {
              select: {
                id: true,
                vendorId: true,
                eventDate: true,
                eventType: true,
                location: true,
                serviceAmount: true,
                extraChargesAmount: true,
                deliveryFee: true,
                platformFee: true,
                taxAmount: true,
                subtotal: true,
                totalAmount: true,
                status: true,
                service: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                  },
                },
                vendor: {
                  select: {
                    id: true,
                    businessName: true,
                    user: {
                      select: {
                        name: true,
                        email: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),

        prisma.vendorJoinPayment.findMany({
          orderBy: {
            createdAt: "desc",
          },
          include: {
            vendor: {
              select: {
                id: true,
                businessName: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        }),
      ]);

    const bookingTransactions = bookingPayments.map((payment) => ({
      id: payment.id,
      type: "BOOKING_PAYMENT" as const,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,

      customer: payment.customer,

      vendor: payment.booking.vendor,

      booking: {
        id: payment.booking.id,
        eventDate: payment.booking.eventDate,
        eventType: payment.booking.eventType,
        location: payment.booking.location,
        status: payment.booking.status,
      },

      service: payment.booking.service,

      breakdown: {
        serviceAmount: payment.booking.serviceAmount,
        extraChargesAmount: payment.booking.extraChargesAmount,
        deliveryFee: payment.booking.deliveryFee,
        subtotal: payment.booking.subtotal,
        platformFee: payment.booking.platformFee,
        taxAmount: payment.booking.taxAmount,
        totalAmount: payment.booking.totalAmount,
      },
    }));

    const vendorTransactions = vendorJoinPayments.map((payment) => ({
      id: payment.id,
      type: "VENDOR_JOINING" as const,
      status:
        payment.status === "PAID"
          ? "PAID"
          : payment.status === "FAILED"
            ? "FAILED"
            : "PENDING",

      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: "RAZORPAY",
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,

      customer: null,

      vendor: {
        id: payment.vendor.id,
        businessName: payment.vendor.businessName,
        user: payment.vendor.user,
      },

      booking: null,

      service: null,

      breakdown: {
        serviceAmount: 0,
        extraChargesAmount: 0,
        deliveryFee: 0,
        subtotal: payment.amount,
        platformFee: payment.amount,
        taxAmount: 0,
        totalAmount: payment.amount,
      },
    }));

    const transactions = [
      ...bookingTransactions,
      ...vendorTransactions,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    const paidBookingPayments = bookingPayments.filter(
      (payment) => payment.status === "PAID"
    );

    const paidVendorPayments = vendorJoinPayments.filter(
      (payment) => payment.status === "PAID"
    );

    const bookingGross = paidBookingPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const vendorJoiningRevenue = paidVendorPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const platformFees = paidBookingPayments.reduce(
      (sum, payment) =>
        sum + Number(payment.booking.platformFee || 0),
      0
    );

    const taxCollected = paidBookingPayments.reduce(
      (sum, payment) =>
        sum + Number(payment.booking.taxAmount || 0),
      0
    );

    const vendorServiceRevenue =
      paidBookingPayments.reduce(
        (sum, payment) =>
          sum +
          Number(payment.booking.serviceAmount || 0) +
          Number(payment.booking.extraChargesAmount || 0) +
          Number(payment.booking.deliveryFee || 0),
        0
      );

    const totalCollected =
      bookingGross + vendorJoiningRevenue;

    const pendingBookingAmount = bookingPayments
      .filter((payment) => payment.status === "PENDING")
      .reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

    const failedBookingAmount = bookingPayments
      .filter((payment) => payment.status === "FAILED")
      .reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

    const refundedBookingAmount = bookingPayments
      .filter((payment) => payment.status === "REFUNDED")
      .reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

    return NextResponse.json({
      success: true,

      summary: {
        totalCollected,
        bookingGross,
        vendorJoiningRevenue,
        platformFees,
        taxCollected,
        vendorServiceRevenue,

        pendingAmount:
          pendingBookingAmount +
          vendorJoinPayments
            .filter(
              (payment) =>
                payment.status === "PENDING" ||
                payment.status === "CREATED"
            )
            .reduce(
              (sum, payment) =>
                sum + Number(payment.amount || 0),
              0
            ),

        failedAmount:
          failedBookingAmount +
          vendorJoinPayments
            .filter(
              (payment) => payment.status === "FAILED"
            )
            .reduce(
              (sum, payment) =>
                sum + Number(payment.amount || 0),
              0
            ),

        refundedAmount: refundedBookingAmount,

        totalTransactions: transactions.length,

        paidTransactions:
          paidBookingPayments.length +
          paidVendorPayments.length,

        bookingTransactions: bookingPayments.length,
        vendorJoinTransactions: vendorJoinPayments.length,
      },

      transactions,
    });
  } catch (error) {
    console.error("Admin finance API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load finance information",
      },
      {
        status: 500,
      }
    );
  }
}
