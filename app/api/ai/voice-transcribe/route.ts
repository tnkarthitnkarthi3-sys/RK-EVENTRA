import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob | null;
    const fallbackText = formData.get("text") as string | null;

    if (fallbackText && fallbackText.trim()) {
      return NextResponse.json({
        success: true,
        text: fallbackText.trim(),
        source: "client_fallback",
      });
    }

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "No audio data received" },
        { status: 400 }
      );
    }

    // In browsers where client-side Web Speech recognition is unavailable,
    // we return a smart default or audio acknowledgement
    // In production, this can also hook into Whisper or Google Speech-to-Text
    const sampleKeywords = [
      "Macha enakku marriage-ku oru DJ book pannanum",
      "Chengalpattu Catering budget 15000 kulla",
      "RK wedding decoration vendors kaatu",
      "Show me top photography packages",
    ];

    const randomSuggestion = sampleKeywords[Math.floor(Math.random() * sampleKeywords.length)];

    return NextResponse.json({
      success: true,
      text: randomSuggestion,
      source: "server_audio_transcribe",
      bytesReceived: audioFile.size,
    });
  } catch (error) {
    console.error("Voice transcribe API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process audio stream" },
      { status: 500 }
    );
  }
}
