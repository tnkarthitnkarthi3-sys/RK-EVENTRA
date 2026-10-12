import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const [vendors, feeSetting] = await Promise.all([
      prisma.vendor.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          services: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              price: true,
              active: true,
            },
          },
          vendorJoinPayments: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              razorpayOrderId: true,
              razorpayPaymentId: true,
              transactionId: true,
              paidAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
      prisma.platformSetting.findUnique({
        where: { key: "vendor_joining_fee" },
      }),
    ]);

    const currentJoiningFee = feeSetting?.value ? parseInt(feeSetting.value, 10) : 800;

    const data = vendors.map((vendor) => {
      const paymentHistory = vendor.vendorJoinPayments;
      const latestPayment = paymentHistory[0] ?? null;
      const isPaid = latestPayment?.status === "PAID";

      // Precise computed workflow status
      let workflowStatus: "PAYMENT_PENDING" | "PAYMENT_FAILED" | "PAID_AWAITING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED" = "PAYMENT_PENDING";

      if (vendor.status === "SUSPENDED") {
        workflowStatus = "SUSPENDED";
      } else if (vendor.status === "REJECTED") {
        workflowStatus = "REJECTED";
      } else if (vendor.status === "APPROVED") {
        workflowStatus = "APPROVED";
      } else if (isPaid) {
        workflowStatus = "PAID_AWAITING_APPROVAL";
      } else if (latestPayment?.status === "FAILED") {
        workflowStatus = "PAYMENT_FAILED";
      } else {
        workflowStatus = "PAYMENT_PENDING";
      }

      return {
        id: vendor.id,
        businessName: vendor.businessName,
        description: vendor.description,
        location: vendor.location,
        profileImage: vendor.profileImage,
        rating: vendor.rating,
        status: vendor.status,
        workflowStatus,
        rejectionReason: (vendor as any).rejectionReason || null,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
        joinedAt: vendor.joinedAt,
        approvedAt: vendor.approvedAt,
        businessPhone: vendor.businessPhone,
        whatsappNumber: vendor.whatsappNumber,
        ownerName: vendor.ownerName,

        owner: {
          id: vendor.user.id,
          name: vendor.user.name,
          email: vendor.user.email,
          phone: vendor.user.phone,
        },

        services: vendor.services,
        joinPayment: latestPayment,
        paymentHistory,
        paymentPaid: isPaid,
        verifiedPaymentAmount: latestPayment?.amount || null,
        transactionReference: latestPayment?.razorpayPaymentId || latestPayment?.transactionId || null,
      };
    });

    const summary = {
      totalVendors: data.length,
      paidAwaitingApproval: data.filter((v) => v.workflowStatus === "PAID_AWAITING_APPROVAL").length,
      paymentPending: data.filter((v) => v.workflowStatus === "PAYMENT_PENDING").length,
      approved: data.filter((v) => v.workflowStatus === "APPROVED").length,
      rejected: data.filter((v) => v.workflowStatus === "REJECTED").length,
      suspended: data.filter((v) => v.workflowStatus === "SUSPENDED").length,
      currentJoiningFee,
    };

    return NextResponse.json({
      success: true,
      summary,
      vendors: data,
    });
  } catch (error) {
    console.error("ADMIN VENDORS API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load vendor information" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.cookies.get("rk_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { vendorId, action, reason, transactionRef, amount, newJoiningFee } = body;

    // Handle joining fee update
    if (action === "UPDATE_JOINING_FEE") {
      if (newJoiningFee === undefined || isNaN(Number(newJoiningFee)) || Number(newJoiningFee) < 0) {
        return NextResponse.json(
          { success: false, message: "Valid joining fee amount required" },
          { status: 400 }
        );
      }

      await prisma.platformSetting.upsert({
        where: { key: "vendor_joining_fee" },
        update: { value: String(newJoiningFee) },
        create: {
          key: "vendor_joining_fee",
          value: String(newJoiningFee),
          description: "Mandatory vendor joining fee in INR",
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          userEmail: admin.email,
          action: "UPDATE_JOINING_FEE",
          resource: "PlatformSetting",
          details: JSON.stringify({ newJoiningFee }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Vendor joining fee updated to ₹${newJoiningFee} for future applications`,
      });
    }

    if (!vendorId || !action) {
      return NextResponse.json(
        { success: false, message: "vendorId and action are required" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        vendorJoinPayments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    const latestPayment = vendor.vendorJoinPayments[0];
    const hasPaid = latestPayment?.status === "PAID";

    let updatedStatus = vendor.status;

    if (action === "APPROVE") {
      // Rule: The vendor must pay the applicable joining fee and pass required verification before approval
      if (!hasPaid) {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot approve unpaid vendor directly. Please verify their joining fee payment or explicitly waive the fee.",
          },
          { status: 400 }
        );
      }

      updatedStatus = "APPROVED";
      await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          rejectionReason: null,
        } as any,
      });
    } else if (action === "REJECT") {
      updatedStatus = "REJECTED";
      await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          status: "REJECTED",
          rejectionReason: reason || "Application rejected by admin",
        } as any,
      });
    } else if (action === "SUSPEND") {
      updatedStatus = "SUSPENDED";
      await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          status: "SUSPENDED",
        },
      });
    } else if (action === "VERIFY_PAYMENT") {
      // Admin manual UPI payment verification
      const verifiedRef = transactionRef ? String(transactionRef).trim() : `MANUAL_VERIFY_${Date.now()}`;
      const verifiedAmount = amount ? Number(amount) : (latestPayment?.amount || 800);

      if (latestPayment) {
        await prisma.vendorJoinPayment.update({
          where: { id: latestPayment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            transactionId: verifiedRef,
            amount: verifiedAmount,
            verifiedById: admin.id,
          },
        });
      } else {
        await prisma.vendorJoinPayment.create({
          data: {
            vendorId: vendor.id,
            userId: vendor.userId,
            amount: verifiedAmount,
            currency: "INR",
            status: "PAID",
            paidAt: new Date(),
            transactionId: verifiedRef,
            verifiedById: admin.id,
          },
        });
      }

      // Automatically approve upon payment verification
      updatedStatus = "APPROVED";
      await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          rejectionReason: null,
        } as any,
      });
    } else if (action === "WAIVE_FEE") {
      // Waive joining fee to 0 and approve
      if (latestPayment) {
        await prisma.vendorJoinPayment.update({
          where: { id: latestPayment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            transactionId: "ADMIN_FEE_WAIVED",
            amount: 0,
            verifiedById: admin.id,
          },
        });
      } else {
        await prisma.vendorJoinPayment.create({
          data: {
            vendorId: vendor.id,
            userId: vendor.userId,
            amount: 0,
            currency: "INR",
            status: "PAID",
            paidAt: new Date(),
            transactionId: "ADMIN_FEE_WAIVED",
            verifiedById: admin.id,
          },
        });
      }

      updatedStatus = "APPROVED";
      await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          rejectionReason: null,
        } as any,
      });
    } else {
      return NextResponse.json(
        { success: false, message: `Unknown action: ${action}` },
        { status: 400 }
      );
    }

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        userEmail: admin.email,
        action: `VENDOR_${action}`,
        resource: "Vendor",
        details: JSON.stringify({
          action,
          vendorId,
          vendorBusinessName: vendor.businessName,
          previousStatus: vendor.status,
          newStatus: updatedStatus,
          reason: reason || null,
          transactionRef: transactionRef || null,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Vendor application updated successfully: ${action}`,
      newStatus: updatedStatus,
    });
  } catch (error) {
    console.error("ADMIN VENDORS PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process vendor action" },
      { status: 500 }
    );
  }
}
