import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [payment, settings] = await Promise.all([
      prisma.vendorJoinPayment.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.platformSetting.findMany({
        where: {
          key: {
            in: [
              "vendor_joining_fee",
              "admin_upi_id",
              "admin_payment_qr_url",
              "admin_contact_mobile",
              "support_email",
              "admin_payment_instructions",
            ],
          },
        },
      }),
    ]);

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const defaultFee = settingsMap.vendor_joining_fee
      ? parseInt(settingsMap.vendor_joining_fee, 10)
      : 800;

    const adminUpiId = settingsMap.admin_upi_id || "7530041288@fam";
    const adminPaymentQrUrl = settingsMap.admin_payment_qr_url || null;
    const adminContactMobile = settingsMap.admin_contact_mobile || "+91 9840011223";
    const supportEmail = settingsMap.support_email || "support@rkeventra.com";
    const paymentInstructions =
      settingsMap.admin_payment_instructions ||
      "Send exact joining fee to admin UPI. Once paid, admin will verify your payment in the admin panel and immediately approve your partner profile!";

    if (!payment) {
      return NextResponse.json({
        exists: false,
        paid: false,
        status: null,
        amount: defaultFee,
        currency: "INR",
        adminUpiId,
        adminPaymentQrUrl,
        adminContactMobile,
        supportEmail,
        paymentInstructions,
      });
    }

    return NextResponse.json({
      exists: true,
      paid: payment.status === "PAID",
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt,
      adminUpiId,
      adminPaymentQrUrl,
      adminContactMobile,
      supportEmail,
      paymentInstructions,
    });
  } catch (error) {
    console.error("Vendor join payment status error:", error);

    return NextResponse.json(
      { error: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}
