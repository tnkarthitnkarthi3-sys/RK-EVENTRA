import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { isRazorpayConfigured, razorpay } from "@/src/lib/razorpay";

const JOIN_FEE = 800;

export async function POST(request: NextRequest) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          error: "Payment gateway setup is incomplete. Please configure the server credentials before accepting payments.",
        },
        { status: 503 }
      );
    }

    const userId = request.cookies.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: {
        id: true,
        businessName: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404 }
      );
    }

    const existingPaid = await prisma.vendorJoinPayment.findFirst({
      where: {
        userId,
        status: "PAID",
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    if (existingPaid) {
      return NextResponse.json({
        alreadyPaid: true,
        paid: true,
        amount: existingPaid.amount,
        currency: existingPaid.currency,
        paymentId: existingPaid.razorpayPaymentId,
      });
    }

    // Read configured joining fee dynamically from PlatformSetting (default 800)
    const feeSetting = await prisma.platformSetting.findUnique({
      where: { key: "vendor_joining_fee" },
    });
    const joinFee = feeSetting?.value ? parseInt(feeSetting.value, 10) : 800;

    const order = await razorpay.orders.create({
      amount: joinFee * 100,
      currency: "INR",
      receipt: `vendor_join_${vendor.id}_${Date.now()}`,
      notes: {
        vendorId: vendor.id,
        userId,
        purpose: "RK EVENTRA Vendor Joining Fee",
      },
    });

    const payment = await prisma.vendorJoinPayment.create({
      data: {
        vendorId: vendor.id,
        userId,
        amount: joinFee,
        currency: "INR",
        status: "CREATED",
        razorpayOrderId: order.id,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyPaid: false,
      paymentRecordId: payment.id,
      orderId: order.id,
      amount: joinFee,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      vendorName: vendor.businessName,
    });
  } catch (error) {
    console.error("Vendor join order error:", error);

    return NextResponse.json(
      { error: "Unable to create Razorpay order" },
      { status: 500 }
    );
  }
}
