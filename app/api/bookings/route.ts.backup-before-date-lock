import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

const ADMIN_COMMISSION = 2000;
const GST_PERCENT = 18;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
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
        vendor: {
          select: {
            id: true,
            businessName: true,
            status: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
          },
        },
        payment: true,
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("GET BOOKINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load bookings",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("rk_user_id")?.value;
    const cookieRole = request.cookies.get("rk_user_role")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer login required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const vendorId =
      typeof body.vendorId === "string"
        ? body.vendorId.trim()
        : "";

    const serviceId =
      typeof body.serviceId === "string"
        ? body.serviceId.trim()
        : "";

    const eventType =
      typeof body.eventType === "string"
        ? body.eventType.trim()
        : "";

    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : "";

    const eventDateInput =
      typeof body.eventDate === "string"
        ? body.eventDate.trim()
        : "";

    if (!vendorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor ID is missing",
        },
        { status: 400 }
      );
    }

    if (!serviceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Service ID is missing",
        },
        { status: 400 }
      );
    }

    if (!eventType) {
      return NextResponse.json(
        {
          success: false,
          message: "Event type is required",
        },
        { status: 400 }
      );
    }

    if (!eventDateInput) {
      return NextResponse.json(
        {
          success: false,
          message: "Event date is required",
        },
        { status: 400 }
      );
    }

    /*
      -----------------------------------------------------
      CUSTOMER VALIDATION
      -----------------------------------------------------
    */

    const customer = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
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

    /*
      -----------------------------------------------------
      SAFE DATE PARSING
      -----------------------------------------------------
    */

    let requestedDate: Date;

    if (/^\d{4}-\d{2}-\d{2}$/.test(eventDateInput)) {
      const [year, month, day] = eventDateInput
        .split("-")
        .map(Number);

      requestedDate = new Date(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0
      );
    } else {
      requestedDate = new Date(eventDateInput);
    }

    if (Number.isNaN(requestedDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid event date",
        },
        { status: 400 }
      );
    }

    const today = startOfDay(new Date());
    const selectedDay = startOfDay(requestedDate);

    if (selectedDay <= today) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a future event date",
        },
        { status: 400 }
      );
    }

    const dayStart = startOfDay(requestedDate);
    const dayEnd = endOfDay(requestedDate);

    /*
      -----------------------------------------------------
      VENDOR VALIDATION
      -----------------------------------------------------
    */

    const vendor = await prisma.vendor.findUnique({
      where: {
        id: vendorId,
      },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            name: true,
            email: true,
          },
        },

        services: {
          where: {
            id: serviceId,
            active: true,
          },
        },

        charges: {
          where: {
            active: true,
          },
        },

        availabilities: {
          where: {
            date: {
              gte: dayStart,
              lte: dayEnd,
            },
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
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor not found",
        },
        { status: 404 }
      );
    }

    /*
      -----------------------------------------------------
      ₹800 VENDOR JOIN PAYMENT CHECK
      -----------------------------------------------------
    */

    const hasPaidJoinFee =
      vendor.vendorJoinPayments.length > 0;

    if (!hasPaidJoinFee) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This vendor has not completed the ₹800 RK EVENTRA joining payment.",
        },
        { status: 409 }
      );
    }

    /*
      -----------------------------------------------------
      SERVICE VALIDATION
      -----------------------------------------------------
    */

    const service = vendor.services[0];

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected service is not available from this vendor.",
        },
        { status: 404 }
      );
    }

    /*
      -----------------------------------------------------
      AVAILABILITY CHECK
      -----------------------------------------------------
    */

    const availability = vendor.availabilities[0];

    if (availability && !availability.available) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vendor is unavailable on the selected date.",
        },
        { status: 409 }
      );
    }

    /*
      -----------------------------------------------------
      DATE LOCK
      One confirmed/pending booking blocks the vendor
      for that event date.
      -----------------------------------------------------
    */

    const existingBooking =
      await prisma.booking.findFirst({
        where: {
          vendorId,
          eventDate: {
            gte: dayStart,
            lte: dayEnd,
          },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This vendor is already booked for the selected date.",
        },
        { status: 409 }
      );
    }

    /*
      -----------------------------------------------------
      SERVER-SIDE PRICE CALCULATION
      -----------------------------------------------------
    */

    const serviceAmount = roundMoney(
      Number(service.price || 0)
    );

    if (
      !Number.isFinite(serviceAmount) ||
      serviceAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor service price is invalid.",
        },
        { status: 400 }
      );
    }

    let deliveryFee = 0;
    let extraChargesAmount = 0;

    for (const charge of vendor.charges) {
      const chargeAmount = Number(charge.amount || 0);

      if (
        !Number.isFinite(chargeAmount) ||
        chargeAmount < 0
      ) {
        continue;
      }

      const calculatedAmount =
        charge.mode === "PERCENTAGE"
          ? serviceAmount * (chargeAmount / 100)
          : chargeAmount;

      const amount = roundMoney(calculatedAmount);

      const type = String(charge.type || "")
        .trim()
        .toUpperCase();

      if (
        type === "DELIVERY" ||
        type === "DELIVERY_CHARGE"
      ) {
        deliveryFee += amount;
      } else {
        extraChargesAmount += amount;
      }
    }

    deliveryFee = roundMoney(deliveryFee);
    extraChargesAmount = roundMoney(extraChargesAmount);

    const vendorAmount = roundMoney(
      serviceAmount +
        deliveryFee +
        extraChargesAmount
    );

    /*
      Admin commission:
      Example:
      Order ₹15,000
      Admin ₹2,000
      Vendor ₹13,000
    */

    const platformFee = Math.min(
      ADMIN_COMMISSION,
      vendorAmount
    );

    const subtotal = roundMoney(
      vendorAmount + platformFee
    );

    const taxAmount = roundMoney(
      subtotal * (GST_PERCENT / 100)
    );

    const totalAmount = roundMoney(
      subtotal + taxAmount
    );

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking amount.",
        },
        { status: 400 }
      );
    }

    /*
      -----------------------------------------------------
      CREATE BOOKING
      -----------------------------------------------------
    */

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        vendorId,
        serviceId,
        eventDate: requestedDate,
        eventType,
        location: location || null,

        serviceAmount,
        extraChargesAmount,
        deliveryFee,
        platformFee,
        taxAmount,
        subtotal,
        totalAmount,

        status: "PENDING",
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
            category: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        booking,

        pricing: {
          serviceAmount,
          deliveryFee,
          extraChargesAmount,
          vendorAmount,
          platformFee,
          subtotal,
          taxAmount,
          totalAmount,
          currency: "INR",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
