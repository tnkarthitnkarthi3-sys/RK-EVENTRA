"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Globe,
  Sliders,
  Calendar,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Mic,
  Zap,
} from "lucide-react";
import RKVendorCard, { VendorCardData } from "@/src/components/ai/RKVendorCard";
import RKVoiceMode from "@/src/components/ai/RKVoiceMode";
import RKComparisonModal from "@/src/components/ai/RKComparisonModal";
import ThemeToggle from "@/src/components/theme/ThemeToggle";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  vendors?: VendorCardData[];
  language?: string;
  action?: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"auto" | "tanglish" | "tamil" | "english">("auto");
  const [voiceActive, setVoiceActive] = useState(false);
  const [comparedVendors, setComparedVendors] = useState<VendorCardData[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "ai-init",
        sender: "bot",
        text: "Vanakkam! 🙏 Welcome to RK AI Dedicated Event Command Center.\n\nType or speak in Tamil, English, or Tanglish:\n• \"Macha enakku marriage-ku oru DJ book pannanum\"\n• \"Chengalpattu, December 20, budget 15000 kulla\"\n• \"RK wedding decoration vendors kaatu\"\n• \"Show catering packages for birthday\"\n\nI will search real admin-approved vendors from the database and help you compare and book!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = (text: string) => {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const clean = text.replace(/[*#_`]/g, "").slice(0, 160);
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (_) {}
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query.trim(),
          conversationHistory: messages.slice(-8),
          preferredLanguage: language,
        }),
      });

      const data = await response.json();

      if (data.action === "CLEAR_CHAT") {
        const reply = data.reply || "Chat cleared! How can I help you plan your celebration?";
        setMessages([
          {
            id: `bot-clr-${Date.now()}`,
            sender: "bot",
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setComparedVendors([]);
        speakText(reply);
        return;
      }

      const reply = data.reply || "Results loaded from verified vendor database.";
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          vendors: data.vendors,
          language: data.language,
          action: data.action,
        },
      ]);
      speakText(reply);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "Encountered network error while connecting to RK AI. Please retry.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareToggle = (vendor: VendorCardData) => {
    if (comparedVendors.some((v) => v.id === vendor.id)) {
      setComparedVendors((prev) => prev.filter((v) => v.id !== vendor.id));
    } else {
      if (comparedVendors.length >= 3) {
        alert("Maximum 3 vendors can be compared at a time.");
        return;
      }
      setComparedVendors((prev) => [...prev, vendor]);
      setShowComparisonModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-violet-500/20 bg-[#0a0d1d]/90 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center font-black text-white text-sm shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              RK
            </div>
            <span className="text-lg font-black tracking-wider text-white">
              RK <span className="text-cyan-400">EVENTRA</span>
            </span>
          </Link>
          <span className="hidden sm:inline-block text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            RK AI Command Hub
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/vendors" className="text-xs text-slate-300 hover:text-cyan-400 font-semibold transition-colors">
            Explore Vendors
          </Link>
          <Link href="/my-bookings" className="text-xs text-slate-300 hover:text-cyan-400 font-semibold transition-colors">
            My Bookings
          </Link>
          {comparedVendors.length > 0 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              className="text-xs bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
            >
              Compare ({comparedVendors.length})
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Status Box */}
          <div className="bg-[#0b1022] border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-violet-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">RK AI Multilingual</h3>
                <div className="flex items-center gap-1.5 text-xs text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Real Database Live</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Natural language Tamil, English, and Tanglish queries with live vendor matching and package comparison.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Response Language Mode</label>
              <div className="flex items-center gap-2 bg-[#070914] border border-cyan-500/30 rounded-xl p-2">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="bg-transparent text-xs text-slate-200 outline-none w-full cursor-pointer"
                >
                  <option value="auto" className="bg-[#0b1022]">Auto (Detect from Message)</option>
                  <option value="tanglish" className="bg-[#0b1022]">Tanglish (Tamil in English)</option>
                  <option value="tamil" className="bg-[#0b1022]">தமிழ் (Tamil Script)</option>
                  <option value="english" className="bg-[#0b1022]">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="bg-[#0b1022] border border-violet-500/25 rounded-2xl p-5 shadow-xl">
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voice / Text Prompts</span>
            </h4>
            <div className="space-y-2">
              {[
                "Macha enakku marriage-ku oru DJ book pannanum",
                "Chengalpattu, December 20, budget 15000 kulla",
                "RK display DJ event list",
                "RK wedding decoration vendors kaatu",
                "En birthday-ku decoration and catering package venum",
                "RK en booking status sollu",
                "RK help",
                "RK clear chat",
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(cmd)}
                  className="w-full text-left text-xs bg-[#070914] hover:bg-[#12193d] border border-slate-800 hover:border-cyan-500/40 text-slate-300 p-2.5 rounded-xl transition-all"
                >
                  &ldquo;{cmd}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat Stream & Vendor Cards */}
        <main className="lg:col-span-3 bg-[#0a0d1e] border border-violet-500/25 rounded-2xl flex flex-col h-[750px] overflow-hidden shadow-2xl">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div className={`max-w-[85%] flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium rounded-tr-none shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                        : "bg-[#0e142d] border border-cyan-500/25 text-slate-100 rounded-tl-none shadow-lg"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Vendor Cards inside chat */}
                  {msg.vendors && msg.vendors.length > 0 && (
                    <div className="w-full mt-4 space-y-3">
                      <div className="text-xs font-bold text-cyan-300 flex items-center justify-between">
                        <span>Matched Verified Vendors ({msg.vendors.length})</span>
                        <span className="text-slate-400 font-normal">Direct from Database</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {msg.vendors.map((v) => (
                          <RKVendorCard
                            key={v.id}
                            vendor={v}
                            onCompare={handleCompareToggle}
                            isCompared={comparedVendors.some((cv) => cv.id === v.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium bg-[#0e142d] p-3 rounded-xl border border-cyan-500/30 w-fit shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>RK AI scanning database for verified vendors...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Bar */}
          <div className="px-4 pt-3 pb-1 bg-[#070914] border-t border-cyan-500/20">
            <RKVoiceMode
              onCommand={(voiceQuery) => handleSendMessage(voiceQuery)}
              active={voiceActive}
              onToggle={setVoiceActive}
              lang={language}
            />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 bg-[#070914] border-t border-slate-800 flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask RK AI in Tamil, English, or Tanglish..."
              className="flex-1 bg-[#0b1022] border border-cyan-500/30 focus:border-cyan-400 text-xs sm:text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)]"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </main>
      </div>

      {showComparisonModal && (
        <RKComparisonModal
          vendors={comparedVendors}
          onClose={() => setShowComparisonModal(false)}
          onRemove={(id) => setComparedVendors((prev) => prev.filter((v) => v.id !== id))}
        />
      )}
    </div>
  );
}
