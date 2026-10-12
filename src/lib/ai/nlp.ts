export type SupportedLanguage = "tamil" | "tanglish" | "english" | "mixed";

export interface ExtractedEntities {
  eventType?: string;
  serviceCategory?: string;
  location?: string;
  budget?: number;
  date?: string;
  isSpecificCommand?: string;
  vendorNames?: string[];
}

export interface IntentResult {
  language: SupportedLanguage;
  intent:
    | "FIND_VENDORS"
    | "CHECK_BOOKING_STATUS"
    | "CHECK_PAYMENT_STATUS"
    | "COMPARE_VENDORS"
    | "VOICE_START"
    | "VOICE_STOP"
    | "CLEAR_CHAT"
    | "HELP"
    | "GREETING"
    | "UNKNOWN";
  entities: ExtractedEntities;
  confidence: number;
}

/**
 * Detect language from text
 */
export function detectLanguage(text: string): SupportedLanguage {
  const clean = text.trim();
  // Check for Tamil Unicode block (U+0B80 to U+0BFF)
  const tamilChars = (clean.match(/[\u0B80-\u0BFF]/g) || []).length;
  if (tamilChars > 3) {
    return "tamil";
  }

  const lower = clean.toLowerCase();

  // Tanglish markers
  const tanglishMarkers = [
    "macha", "machi", "thala", "bro", "enakku", "venum", "pannanum",
    "kulla", "solli", "sollu", "kaatu", "parunga", "paaru", "irukku",
    "irukkaanga", "pannalaam", "enna", "epdi", "illai", "inga", "unga",
    "kalyanam", "thirumanam", "piranthanal", "mudiyuma", "kudunga",
    "pannunga", "aacha", "aachu", "paakanum", "theva", "theriyuma"
  ];

  let tanglishScore = 0;
  for (const marker of tanglishMarkers) {
    const regex = new RegExp(`\\b${marker}\\b`, "i");
    if (regex.test(lower)) {
      tanglishScore += 1;
    }
  }

  // Check for common suffixes like -ku, -la, -oda
  if (/\b\w+(ku|la|oda|kulla)\b/i.test(lower)) {
    tanglishScore += 1;
  }

  if (tanglishScore >= 1) {
    // If it has substantial English keywords combined
    if (lower.includes("wedding") || lower.includes("dj") || lower.includes("budget") || lower.includes("event")) {
      return "tanglish"; // natural Tanglish
    }
    return "tanglish";
  }

  // Mixed check
  if (tamilChars > 0 && /[a-zA-Z]/.test(clean)) {
    return "mixed";
  }

  return "english";
}

/**
 * Extract intent and entities from user input
 */
export function extractIntent(text: string): IntentResult {
  const language = detectLanguage(text);
  const lower = text.toLowerCase().trim();

  // Clean command prefixes (e.g. "RK", "rk", "hey rk", "rk ")
  const stripped = lower.replace(/^(hey\s+)?rk\s*[:,]?\s*/i, "").trim();

  // 1. Voice commands
  if (/^(start|open voice|voice start|listen)\b/i.test(stripped) || stripped === "start") {
    return {
      language,
      intent: "VOICE_START",
      entities: { isSpecificCommand: "START" },
      confidence: 1.0,
    };
  }

  if (/^(stop|close voice|voice stop|cancel voice)\b/i.test(stripped) || stripped === "stop") {
    return {
      language,
      intent: "VOICE_STOP",
      entities: { isSpecificCommand: "STOP" },
      confidence: 1.0,
    };
  }

  // 2. Clear Chat
  if (/clear(\s+the)?\s+chat|delete\s+chat|reset\s+chat|clear/i.test(stripped) && (stripped.includes("chat") || stripped === "clear")) {
    return {
      language,
      intent: "CLEAR_CHAT",
      entities: { isSpecificCommand: "CLEAR_CHAT" },
      confidence: 1.0,
    };
  }

  // 3. Help
  if (/^(help|commands|guide|enna panna mudiyum|what can you do|help me)\b/i.test(stripped)) {
    return {
      language,
      intent: "HELP",
      entities: { isSpecificCommand: "HELP" },
      confidence: 1.0,
    };
  }

  // 4. Booking status
  if (
    /booking(\s+status|\s+details)?|status sollu|status enna|en booking|my booking/i.test(stripped) &&
    !stripped.includes("payment")
  ) {
    return {
      language,
      intent: "CHECK_BOOKING_STATUS",
      entities: {},
      confidence: 0.95,
    };
  }

  // 5. Payment status
  if (
    /payment(\s+status|\s+success|\s+done)?|payment success aacha|kaasu kattiyacha|payment checking/i.test(stripped)
  ) {
    return {
      language,
      intent: "CHECK_PAYMENT_STATUS",
      entities: {},
      confidence: 0.95,
    };
  }

  // 6. Compare vendors
  if (/compare|oppidu|differ|comparison/i.test(stripped)) {
    return {
      language,
      intent: "COMPARE_VENDORS",
      entities: {},
      confidence: 0.9,
    };
  }

  // 7. Greeting
  if (/^(hi|hello|vanakkam|vanakam|hey|good morning|good evening)\b/i.test(stripped)) {
    return {
      language,
      intent: "GREETING",
      entities: {},
      confidence: 0.9,
    };
  }

  // 8. Find Vendors & Extract Entities
  const entities: ExtractedEntities = {};

  // Event Types
  if (/wedding|marriage|kalyanam|thirumanam|mandapam|marraige/i.test(stripped)) {
    entities.eventType = "Wedding";
  } else if (/birthday|bday|piranthanal|piranthanaluku/i.test(stripped)) {
    entities.eventType = "Birthday";
  } else if (/engagement|nitchayam|nitchayathartham/i.test(stripped)) {
    entities.eventType = "Engagement";
  } else if (/reception/i.test(stripped)) {
    entities.eventType = "Reception";
  } else if (/party|gala/i.test(stripped)) {
    entities.eventType = "Party";
  } else if (/corporate|office|meeting/i.test(stripped)) {
    entities.eventType = "Corporate";
  } else if (/college|symposium|culturals/i.test(stripped)) {
    entities.eventType = "College";
  }

  // Service Category
  if (/\bdj\b|music|disc\s*jockey|paatu/i.test(stripped)) {
    entities.serviceCategory = "DJ and Entertainment";
  } else if (/sound|audio|speaker|line array|mic/i.test(stripped)) {
    entities.serviceCategory = "Audio and Sound Systems";
  } else if (/light|lighting|par can|laser/i.test(stripped)) {
    entities.serviceCategory = "Lighting Systems";
  } else if (/cater|catering|food|lunch|dinner|meals|sapadu|biryani/i.test(stripped)) {
    entities.serviceCategory = "Catering";
  } else if (/photo|photography|camera|shoot|photographer|candid/i.test(stripped)) {
    entities.serviceCategory = "Photography";
  } else if (/video|videography|drone|cinematography/i.test(stripped)) {
    entities.serviceCategory = "Videography";
  } else if (/flower|poo|garland/i.test(stripped)) {
    entities.serviceCategory = "Flower Decoration";
  } else if (/decor|decoration|alangaaram|backdrop|balloon/i.test(stripped)) {
    entities.serviceCategory = "Wedding Decoration";
  } else if (/stage|mandap|truss/i.test(stripped)) {
    entities.serviceCategory = "Stage Decoration";
  } else if (/generator|genset|current|power backup/i.test(stripped)) {
    entities.serviceCategory = "Generator Services";
  } else if (/makeup|bridal|beautician|styling/i.test(stripped)) {
    entities.serviceCategory = "Makeup and Styling";
  }

  // Location
  if (/chengalpattu|chengalpet|cpt/i.test(stripped)) {
    entities.location = "Chengalpattu";
  } else if (/chennai|madras/i.test(stripped)) {
    entities.location = "Chennai";
  } else if (/tambaram/i.test(stripped)) {
    entities.location = "Tambaram";
  } else if (/kanchipuram|kanchi/i.test(stripped)) {
    entities.location = "Kanchipuram";
  } else if (/coimbatore|kovai/i.test(stripped)) {
    entities.location = "Coimbatore";
  } else if (/madurai/i.test(stripped)) {
    entities.location = "Madurai";
  } else if (/salem/i.test(stripped)) {
    entities.location = "Salem";
  }

  // Budget Extraction
  // matches: "15000 kulla", "15000 budget", "₹15000", "under 15000", "15k", "15,000"
  const budgetMatch = stripped.match(/(?:budget|under|below|rs\.?|₹|\b)?\s*(\d{1,3}(?:,\d{3})+|\d+)\s*(k|kulla|rs|inr|\b)/i);
  if (budgetMatch) {
    let valStr = budgetMatch[1].replace(/,/g, "");
    let amount = parseFloat(valStr);
    if (budgetMatch[2]?.toLowerCase() === "k" && amount < 1000) {
      amount *= 1000;
    }
    // Only accept realistic budgets
    if (amount >= 500 && amount <= 5000000) {
      entities.budget = amount;
    }
  }

  // Date Extraction
  const dateMatch = stripped.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})|\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
  if (dateMatch) {
    entities.date = dateMatch[0];
  } else if (/tomorrow|naalaikku|nalaiku/i.test(stripped)) {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    entities.date = tmrw.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return {
    language,
    intent: "FIND_VENDORS",
    entities,
    confidence: 0.9,
  };
}

/**
 * Generate assistant responses in the user's language & style
 */
export function generateResponse(
  intent: IntentResult,
  vendorCount: number,
  authenticated: boolean = false,
  extraData?: any
): string {
  const lang = intent.language;
  const { eventType, serviceCategory, location, budget, date } = intent.entities;

  // 1. Voice commands
  if (intent.intent === "VOICE_START") {
    if (lang === "tamil") return "RK வாய்ஸ் மோடு தொடங்கப்பட்டது. உங்கள் கேள்வியைக் கூறுங்கள், நான் கேட்கிறேன்! 🎙️";
    if (lang === "tanglish") return "RK Voice mode start aayiruchu! Unga requirement-a pesunga, naan ketkuren 🎙️";
    return "RK Voice mode activated. Speak your request, I am listening! 🎙️";
  }

  if (intent.intent === "VOICE_STOP") {
    if (lang === "tamil") return "RK வாய்ஸ் மோடு நிறுத்தப்பட்டது. மைக்ரோஃபோன் அணைக்கப்பட்டது.";
    if (lang === "tanglish") return "RK Voice stop aayiduchu. Microphone release panniyachu 👍";
    return "RK Voice mode stopped. Microphone has been released.";
  }

  if (intent.intent === "CLEAR_CHAT") {
    if (lang === "tamil") return "அரட்டை வரலாறு அழிக்கப்பட்டது. நான் உங்களுக்கு மீண்டும் எப்படி உதவ முடியும்?";
    if (lang === "tanglish") return "Chat clear panniyachu! Pudhusa enna search pannanum sollunga?";
    return "Chat history cleared. How can I help you plan your event today?";
  }

  if (intent.intent === "HELP") {
    if (lang === "tamil") {
      return `வணக்கம்! நான் உங்கள் RK AI உதவியாளர். நீங்கள் என்னிடம் கேட்கக்கூடியவை:
1. "எனக்கு திருமணத்திற்கு DJ வேண்டும்"
2. "செங்கல்பட்டில் ₹15000க்குள் DJ பட்டியல் காட்டு"
3. "என் பிறந்தநாளுக்கு அலங்காரம் மற்றும் கேட்டரிங் வேண்டும்"
4. "என் புக்கிங் நிலவரம் சொல்"
5. வாய்ஸ் கட்டளைகள்: "RK start", "RK stop", "RK clear chat"`;
    }
    if (lang === "tanglish") {
      return `Hello! Naan unga RK AI Assistant. Neenga enkitta direct-a Tanglish-la kekkalam:
1. "Macha enakku marriage-ku oru DJ book pannanum"
2. "Chengalpattu, December 20, budget 15000 kulla"
3. "RK display DJ event list"
4. "En birthday-ku decoration and catering package venum"
5. "RK en booking status sollu"
6. Voice Commands: "RK start", "RK stop", "RK clear chat"`;
    }
    return `Hello! I am RK AI, your event planning assistant. You can ask me:
1. "I need a DJ for my wedding"
2. "Find DJ in Chengalpattu under ₹15000"
3. "Show catering packages for birthday"
4. "Show my booking status"
5. Voice Commands: "RK start", "RK stop", "RK clear chat", "RK help"`;
  }

  if (intent.intent === "GREETING") {
    if (lang === "tamil") return "வணக்கம்! RK Eventra-விற்கு நல்வரவு. உங்கள் திருமண, பிறந்தநாள் அல்லது விழா நிகழ்ச்சிகளுக்கு என்ன சேவை தேவை?";
    if (lang === "tanglish") return "Vanakkam! RK Eventra-ku welcome. Unga event-ku DJ, Lighting, Catering, Decoration enna venum-nu sollunga, naan ready-a irukken! 😊";
    return "Welcome to RK Eventra! Which event service are you planning today? I can help you find DJs, Catering, Photography, Decoration, and more.";
  }

  if (intent.intent === "CHECK_BOOKING_STATUS") {
    if (!authenticated) {
      if (lang === "tamil") return "உங்கள் புக்கிங் நிலவரத்தை சரிபார்க்க தயவுசெய்து உங்கள் வாடிக்கையாளர் கணக்கில் உள்நுழையவும்.";
      if (lang === "tanglish") return "Unga booking status paaka first login pannunga bro. Sign in pannadhukku appram real booking progress kaatren.";
      return "Please sign in to your customer account to track your genuine booking progress.";
    }
    if (extraData?.bookings?.length === 0) {
      if (lang === "tamil") return "உங்களிடம் தற்போது செயலில் உள்ள புக்கிங் எதுவும் இல்லை. புதிய சேவையை முன்பதிவு செய்ய விரும்புகிறீர்களா?";
      if (lang === "tanglish") return "Unga account-la currently active bookings edhuvum illa. Pudhu service explore panni book pannalaam!";
      return "You currently have no active bookings in your account. Would you like to explore services?";
    }
    const b = extraData.bookings[0];
    if (lang === "tamil") {
      return `உங்கள் சமீபத்திய புக்கிங் (${b.eventType} - ₹${b.totalAmount}): நிலை தற்போது "${b.status}". தேதி: ${new Date(b.eventDate).toLocaleDateString()}.`;
    }
    if (lang === "tanglish") {
      return `Unga latest booking (${b.eventType} - ₹${b.totalAmount}): Current status "${b.status}". Event Date: ${new Date(b.eventDate).toLocaleDateString()}. My Bookings page-la full timeline track pannalaam!`;
    }
    return `Your latest booking (${b.eventType} - ₹${b.totalAmount}) is currently "${b.status}". Event Date: ${new Date(b.eventDate).toLocaleDateString()}.`;
  }

  if (intent.intent === "CHECK_PAYMENT_STATUS") {
    if (!authenticated) {
      if (lang === "tanglish") return "Payment status verify panna unga account-la login pannanum.";
      return "Please sign in to verify your payment status.";
    }
    if (extraData?.lastPayment) {
      const p = extraData.lastPayment;
      if (lang === "tanglish") {
        return `Unga payment status: "${p.status}". Amount: ₹${p.amount}. Transaction ID: ${p.transactionId || p.razorpayPaymentId || "Verified"}.`;
      }
      return `Your payment status is "${p.status}". Verified Amount: ₹${p.amount}. Transaction ID: ${p.transactionId || p.razorpayPaymentId || "Verified"}.`;
    }
    return "No payment record found for this booking.";
  }

  if (intent.intent === "COMPARE_VENDORS") {
    if (lang === "tanglish") {
      return "Selected vendors-oda packages, prices, reviews and availability comparison window open pannirukken. Check pannitu best vendor choose pannunga! ⚖️";
    }
    if (lang === "tamil") {
      return "தேர்ந்தெடுக்கப்பட்ட விற்பனையாளர்களின் தொகுப்புகள், கட்டணம் மற்றும் மதிப்பீடுகளை ஒப்பிடும் சாளரம் திறக்கப்பட்டுள்ளது. சரிபார்க்கவும்!";
    }
    return "Here is the side-by-side comparison of packages, pricing, verified reviews, and equipment features.";
  }

  // 9. Vendor Search Responses with follow-up intelligence
  const hasService = Boolean(serviceCategory);
  const hasLoc = Boolean(location);
  const hasBudget = Boolean(budget);

  // If customer only said "Macha enakku marriage-ku oru DJ book pannanum"
  if (hasService && !hasLoc && !hasBudget && !date) {
    if (lang === "tanglish") {
      return `Sure! 😊 ${eventType || "Event"}-ku ${serviceCategory} vendors find panniduren. Ungaloda event location, date, and budget enna?`;
    }
    if (lang === "tamil") {
      return `நிச்சயமாக! 😊 ${eventType || "நிகழ்ச்சி"}க்கான ${serviceCategory} விற்பனையாளர்களைக் கண்டறிய உங்கள் இடம் (Location), தேதி மற்றும் பட்ஜெட் என்னவென்று கூறுங்கள்?`;
    }
    return `Sure! 😊 I'll help you find top-rated ${serviceCategory} vendors for your ${eventType || "event"}. What is your location, event date, and approximate budget?`;
  }

  // Vendors found in DB
  if (vendorCount > 0) {
    const locText = location ? `${location}-la ` : "";
    const bgtText = budget ? `₹${budget.toLocaleString()} kulla ` : "";

    if (lang === "tanglish") {
      return `Un budget-kulla available-a irukkura ${serviceCategory || "event"} vendors inga irukkaanga (${vendorCount} verified vendors found). Packages, reviews, and availability compare pannitu choose pannalaam! 👍`;
    }
    if (lang === "tamil") {
      return `உங்கள் பட்ஜெட்டிற்குள் கிடைக்கும் ${serviceCategory || "சேவை"} விற்பனையாளர்கள் இங்கே பட்டியலிடப்பட்டுள்ளனர் (${vendorCount} விற்பனையாளர்கள்). விவரங்களை சரிபார்த்து முன்பதிவு செய்யலாம்!`;
    }
    return `Here are the matching active vendors found in the database (${vendorCount} verified vendors). You can compare packages, check availability, or proceed to book!`;
  }

  // No vendors matching
  if (lang === "tanglish") {
    return `Sorry, ${location || "andha location"}-la unga budget-kulla matching active vendors ippo kedaikkala. Budget-a konjam increase pannalaam, illana nearby Chennai/Chengalpattu area select panni try pannunga.`;
  }
  if (lang === "tamil") {
    return `மன்னிக்கவும், நீங்கள் குறிப்பிட்ட பகுதியில் உங்கள் பட்ஜெட்டுக்கு தகுந்த செயலில் உள்ள விற்பனையாளர்கள் தற்போது இல்லை. அருகிலுள்ள பகுதியையோ அல்லது பட்ஜெட்டை மாற்றியோ முயற்சி செய்து பாருங்கள்.`;
  }
  return `No approved vendors matching all criteria were found in our database. Try expanding your search area or adjusting your budget range.`;
}
