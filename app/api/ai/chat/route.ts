import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { extractIntent, generateResponse, SupportedLanguage, ExtractedEntities } from "@/src/lib/ai/nlp";
import { searchVendorsFromDb } from "@/src/lib/ai/vendorSearch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const conversationHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];
    const preferredLanguage = body.preferredLanguage as SupportedLanguage | "auto" | undefined;

    if (!message) {
      return NextResponse.json({ success: false, error: "Empty message" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("rk_user_id")?.value;

    // 1. Extract intent & entities from current message
    const intentResult = extractIntent(message);

    if (preferredLanguage && preferredLanguage !== "auto") {
      intentResult.language = preferredLanguage;
    }

    // 2. Context merging from previous conversation turns
    // E.g. Turn 1: "Macha enakku marriage-ku oru DJ book pannanum" (Service: DJ, Event: Wedding)
    // Turn 2: "Chengalpattu, December 20, budget 15000 kulla" (Location: Chengalpattu, Date: Dec 20, Budget: 15000)
    const mergedEntities: ExtractedEntities = { ...intentResult.entities };

    if (!mergedEntities.serviceCategory || !mergedEntities.eventType) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const prevMsg = conversationHistory[i];
        if (prevMsg.sender === "user" && typeof prevMsg.text === "string") {
          const prevIntent = extractIntent(prevMsg.text);
          if (!mergedEntities.serviceCategory && prevIntent.entities.serviceCategory) {
            mergedEntities.serviceCategory = prevIntent.entities.serviceCategory;
          }
          if (!mergedEntities.eventType && prevIntent.entities.eventType) {
            mergedEntities.eventType = prevIntent.entities.eventType;
          }
          if (!mergedEntities.location && prevIntent.entities.location) {
            mergedEntities.location = prevIntent.entities.location;
          }
        }
      }
    }

    intentResult.entities = mergedEntities;

    // 3. User Specific queries (Booking / Payment status)
    let extraData: any = {};
    if (intentResult.intent === "CHECK_BOOKING_STATUS" || intentResult.intent === "CHECK_PAYMENT_STATUS") {
      if (userId) {
        const bookings = await prisma.booking.findMany({
          where: { customerId: userId },
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            service: true,
            vendor: true,
            payment: true,
          },
        });
        extraData.bookings = bookings;
        if (bookings.length > 0 && bookings[0].payment) {
          extraData.lastPayment = bookings[0].payment;
        }
      }
    }

    // 4. Vendors Search from Database
    let matchingVendors: any[] = [];
    if (
      intentResult.intent === "FIND_VENDORS" ||
      mergedEntities.serviceCategory ||
      mergedEntities.location ||
      mergedEntities.budget
    ) {
      // Query database only if at least serviceCategory, location, or explicit search was asked
      matchingVendors = await searchVendorsFromDb(mergedEntities);
    }

    // 5. Generate Response
    const replyText = generateResponse(
      intentResult,
      matchingVendors.length,
      Boolean(userId),
      extraData
    );

    return NextResponse.json({
      success: true,
      reply: replyText,
      language: intentResult.language,
      intent: intentResult.intent,
      entities: mergedEntities,
      vendors: matchingVendors,
      action:
        intentResult.intent === "CLEAR_CHAT"
          ? "CLEAR_CHAT"
          : intentResult.intent === "VOICE_START"
          ? "VOICE_START"
          : intentResult.intent === "VOICE_STOP"
          ? "VOICE_STOP"
          : null,
    });
  } catch (error) {
    console.error("AI CHAT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        reply: "Sorry, I encountered an internal error. Please try again or rephrase your request.",
        error: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
