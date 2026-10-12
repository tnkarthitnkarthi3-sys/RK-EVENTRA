"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, RefreshCw, Volume2, Globe, Bot, User, Scale, Zap } from "lucide-react";
import RKVendorCard, { VendorCardData } from "./RKVendorCard";
import RKVoiceMode from "./RKVoiceMode";
import RKComparisonModal from "./RKComparisonModal";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  vendors?: VendorCardData[];
  language?: string;
  action?: string;
}

export default function RKFloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"auto" | "tanglish" | "tamil" | "english">("auto");
  const [voiceActive, setVoiceActive] = useState(false);
  const [comparedVendors, setComparedVendors] = useState<VendorCardData[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "bot",
          text: "Vanakkam! 🙏 I am RK AI, your futuristic event booking copilot. Tamil, English, or Tanglish-la requirements sollunga — DJ, Catering, Photography, Wedding Decorator real verified database vendors-ah find panni tharen! ✨",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = (text: string) => {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        // Clean markdown symbols for cleaner speech
        const clean = text.replace(/[*#_`]/g, "").slice(0, 160);
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (_) {}
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          conversationHistory: messages.slice(-6),
          preferredLanguage: language,
        }),
      });

      const data = await response.json();

      if (data.action === "CLEAR_CHAT") {
        const reply = data.reply || "Chat history cleared. How can I assist you with your celebration?";
        setMessages([
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setComparedVendors([]);
        speakText(reply);
        return;
      }

      const reply = data.reply || "I found verified details for your request.";
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        vendors: data.vendors,
        language: data.language,
        action: data.action,
      };

      setMessages((prev) => [...prev, botMessage]);
      speakText(reply);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "Sorry, I had trouble reaching the AI server. Please check your connection and try again.",
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
        alert("You can compare up to 3 vendors simultaneously.");
        return;
      }
      setComparedVendors((prev) => [...prev, vendor]);
      setShowComparisonModal(true);
    }
  };

  const quickPrompts = [
    "Macha enakku marriage-ku oru DJ book pannanum",
    "Chengalpattu, December 20, budget 15000 kulla",
    "RK wedding decoration vendors kaatu",
    "En birthday-ku decoration and catering package venum",
    "RK en booking status sollu",
    "RK help",
  ];

  return (
    <>
      {/* Floating Trigger Button - Neon Gradient Cyberpunk Glow */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#0d1226] via-[#101736] to-[#0d1226] border border-cyan-400/60 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 group"
          title="Open RK AI Event Planning Assistant"
        >
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5 animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5" />
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white">
              <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-black text-white flex items-center gap-1.5 tracking-wide">
              <span>RK AI Voice & Chat</span>
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-cyan-300/90 font-medium">Tamil • Tanglish • English</div>
          </div>
        </button>
      )}

      {/* Floating Chat Modal - Futuristic Dark Navy with Glowing Borders */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[450px] h-[640px] max-h-[88vh] bg-[#070a16] border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-100 animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0d132b] via-[#12183d] to-[#0d132b] border-b border-cyan-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 rounded-xl bg-gradient-to-tr from-violet-600/40 to-cyan-500/30 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Bot className="w-5 h-5 text-cyan-300" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5 shadow-[0_0_6px_#06b6d4]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>RK AI Assistant</span>
                  <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono">
                    Online
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Multilingual Event Matchmaker & Voice</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {comparedVendors.length > 0 && (
                <button
                  onClick={() => setShowComparisonModal(true)}
                  className="flex items-center gap-1 text-[11px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-2 py-1 rounded-lg font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-colors"
                  title="View Vendor Comparison"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>({comparedVendors.length})</span>
                </button>
              )}

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-[#090d1f] border border-cyan-500/30 rounded-lg px-2 py-1 text-xs text-slate-300">
                <Globe className="w-3 h-3 text-cyan-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="bg-transparent text-[11px] text-slate-200 outline-none cursor-pointer"
                >
                  <option value="auto" className="bg-[#090d1f]">Auto</option>
                  <option value="tanglish" className="bg-[#090d1f]">Tanglish</option>
                  <option value="tamil" className="bg-[#090d1f]">தமிழ் (Tamil)</option>
                  <option value="english" className="bg-[#090d1f]">English</option>
                </select>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Pills */}
          <div className="p-2 bg-[#090d1f]/80 border-b border-cyan-500/15 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="text-[11px] bg-[#0d132b] hover:bg-[#141b3d] text-cyan-200/90 border border-cyan-500/25 px-2.5 py-1 rounded-full shrink-0 transition-all hover:border-cyan-400/50"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#070a16] via-[#090d1f] to-[#070a16]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div className={`max-w-[85%] flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold rounded-tr-none shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "bg-[#0c1126] border border-cyan-500/25 text-slate-100 rounded-tl-none shadow-lg"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Vendor Cards inside chat */}
                  {msg.vendors && msg.vendors.length > 0 && (
                    <div className="w-full mt-2.5 space-y-2">
                      <div className="text-[11px] font-bold text-cyan-300 flex items-center justify-between">
                        <span>Verified Database Vendors ({msg.vendors.length})</span>
                        <span className="text-slate-400 font-normal">Active & Approved</span>
                      </div>
                      {msg.vendors.map((v) => (
                        <RKVendorCard
                          key={v.id}
                          vendor={v}
                          onCompare={handleCompareToggle}
                          isCompared={comparedVendors.some((cv) => cv.id === v.id)}
                        />
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-cyan-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium bg-[#0b1022] p-2.5 rounded-xl border border-cyan-500/30 w-fit shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>RK AI searching database for real vendors...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Bar */}
          <div className="px-3 pt-2 bg-[#070a16] border-t border-cyan-500/15">
            <RKVoiceMode
              onCommand={(voiceText) => handleSendMessage(voiceText)}
              active={voiceActive}
              onToggle={setVoiceActive}
              lang={language}
            />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#070a16] border-t border-slate-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type in Tamil, English, or Tanglish..."
              className="flex-1 bg-[#0b1020] border border-cyan-500/30 focus:border-cyan-400 text-xs text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-xl font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparisonModal && (
        <RKComparisonModal
          vendors={comparedVendors}
          onClose={() => setShowComparisonModal(false)}
          onRemove={(id) => setComparedVendors((prev) => prev.filter((v) => v.id !== id))}
        />
      )}
    </>
  );
}
