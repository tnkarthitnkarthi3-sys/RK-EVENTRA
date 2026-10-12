"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  variant?: "icon" | "pill" | "floating";
  className?: string;
}

export default function ThemeToggle({
  variant = "icon",
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-800/50 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === "dark";

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
          isDark
            ? "bg-[#0b1020] text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            : "bg-white text-amber-600 border border-amber-300 hover:border-amber-400 shadow-md"
        } ${className}`}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {isDark ? (
            <Moon className="w-4 h-4 text-cyan-400 transition-transform duration-300 rotate-0" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-90" />
          )}
        </div>
        <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
      </button>
    );
  }

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group ${
          isDark
            ? "bg-gradient-to-r from-[#0d1226] via-[#101736] to-[#0d1226] border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            : "bg-white border-2 border-amber-400 text-amber-600 shadow-xl shadow-amber-500/10"
        } ${className}`}
        title={isDark ? "Switch to Luxury Light Mode" : "Switch to Cyberpunk Dark Mode"}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          {isDark ? (
            <Moon className="w-5 h-5 text-cyan-400 transition-all duration-300 group-hover:rotate-12" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500 transition-all duration-300 group-hover:rotate-45" />
          )}
        </div>
        <span className="text-xs font-black hidden sm:inline-block pr-1 tracking-wide">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      </button>
    );
  }

  // Default: icon button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden ${
        isDark
          ? "bg-[#0b1020] text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)] hover:bg-[#111730]"
          : "bg-white text-amber-600 border border-amber-300 hover:border-amber-400 shadow-sm hover:bg-amber-50/50"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-cyan-400 transition-transform duration-300" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-90" />
      )}
    </button>
  );
}
