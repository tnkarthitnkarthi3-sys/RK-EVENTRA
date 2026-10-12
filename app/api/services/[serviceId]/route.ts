import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ serviceId: string }> }
) {
  try {
    const { serviceId } = await context.params;

    if (!serviceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Service ID is required",
        },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            description: true,
            location: true,
            profileImage: true,
            rating: true,
            status: true,
            upiId: true,
            paymentQrUrl: true,
            paymentMobile: true,
            paymentDisplayName: true,
            paymentInstructions: true,
            showManualUpi: true,

            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },

            charges: {
              where: {
                active: true,
              },
              select: {
                id: true,
                name: true,
                type: true,
                amount: true,
                mode: true,
                description: true,
              },
            },

            vendorJoinPayments: {
              where: {
                status: "PAID",
              },
              orderBy: {
                paidAt: "desc",
              },
              take: 1,
              select: {
                id: true,
                amount: true,
                currency: true,
                status: true,
                razorpayPaymentId: true,
                transactionId: true,
                paidAt: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: "Service not found",
        },
        { status: 404 }
      );
    }

    if (!service.active) {
      return NextResponse.json(
        {
          success: false,
          message: "This service is currently unavailable",
        },
        { status: 404 }
      );
    }

    if (!service.vendor) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor not found",
        },
        { status: 404 }
      );
    }

    const vendorHasPaidJoinFee =
      service.vendor.vendorJoinPayments.length > 0;

    if (!vendorHasPaidJoinFee) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor joining payment is incomplete",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        price: Number(service.price),
        active: service.active,

        vendor: {
          id: service.vendor.id,
          businessName: service.vendor.businessName,
          description: service.vendor.description,
          location: service.vendor.location,
          profileImage: service.vendor.profileImage,
          rating: service.vendor.rating,
          status: service.vendor.status,

          owner: service.vendor.user.name,
          email: service.vendor.user.email,
          phone: service.vendor.user.phone,
          upiId: service.vendor.upiId,
          paymentQrUrl: service.vendor.paymentQrUrl,
          paymentMobile: service.vendor.paymentMobile,
          paymentDisplayName: service.vendor.paymentDisplayName,
          paymentInstructions: service.vendor.paymentInstructions,
          showManualUpi: service.vendor.showManualUpi,

          charges: service.vendor.charges.map((charge) => ({
            id: charge.id,
            name: charge.name,
            type: charge.type,
            amount: Number(charge.amount),
            mode: charge.mode,
            description: charge.description,
          })),
        },
      },
    });
  } catch (error) {
    console.error("GET SERVICE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load service",
      },
      { status: 500 }
    );
  }
}
