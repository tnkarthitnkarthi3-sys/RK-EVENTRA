import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "app/vendor/profile/page.tsx");
let code = fs.readFileSync(filePath, "utf8");

// Replacements
code = code.replace(/bg-\[#FAF9F6\]/g, "bg-[#070b14]");
code = code.replace(/text-\[#0F172A\]/g, "text-slate-100");
code = code.replace(/bg-gradient-to-b from-\[#0A1128\] via-\[#0E1A38\] to-\[#12224A\]/g, "bg-gradient-to-b from-[#0b1329] via-[#070b14] to-[#070b14]");
code = code.replace(/bg-\[#0A1128\] text-white border-b border-\[#D4AF37\]\/25/g, "bg-[#070b14]/90 backdrop-blur-xl border-b border-amber-500/20 text-slate-100 shadow-xl shadow-black/40");
code = code.replace(/bg-\[#D4AF37\] text-\[#0A1128\]/g, "bg-amber-500 text-slate-950");
code = code.replace(/text-\[#E6C687\]/g, "text-amber-300");
code = code.replace(/text-\[#D4AF37\]/g, "text-amber-400");
code = code.replace(/bg-\[#D4AF37\]\/15/g, "bg-amber-500/15");
code = code.replace(/border-\[#D4AF37\]\/30/g, "border-amber-500/30");
code = code.replace(/border-\[#D4AF37\]\/20/g, "border-amber-500/20");
code = code.replace(/from-\[#D4AF37\] via-\[#E6C687\] to-\[#D4AF37\]/g, "from-amber-500 via-amber-400 to-amber-500");

// Containers & Cards
code = code.replace(/bg-white rounded-3xl p-6 sm:p-8 border border-stone-200\/90 shadow-sm space-y-6 animate-fadeIn/g, "bg-[#0e172e]/80 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-6 animate-fadeIn");
code = code.replace(/border-stone-300 bg-stone-50\/50/g, "border-slate-700 bg-[#070b14]");
code = code.replace(/border-stone-300 bg-white/g, "border-slate-700 bg-[#070b14]");
code = code.replace(/bg-stone-50 border border-stone-200/g, "bg-[#070b14] border border-slate-800");
code = code.replace(/bg-\[#FDFCF7\] border border-\[#D4AF37\]\/30/g, "bg-[#070b14] border border-amber-500/30");
code = code.replace(/border-stone-100/g, "border-slate-800");
code = code.replace(/border-stone-200/g, "border-slate-800");
code = code.replace(/border-stone-300/g, "border-slate-700");

// Text Colors
code = code.replace(/text-stone-900/g, "text-white");
code = code.replace(/text-stone-800/g, "text-slate-200");
code = code.replace(/text-stone-700/g, "text-slate-300");
code = code.replace(/text-stone-600/g, "text-slate-300");
code = code.replace(/text-stone-500/g, "text-slate-400");
code = code.replace(/text-stone-400/g, "text-slate-500");
code = code.replace(/text-stone-300/g, "text-slate-600");

// Notifications
code = code.replace(/bg-emerald-50 border border-emerald-300 text-emerald-900/g, "bg-emerald-950/80 border border-emerald-500/40 text-emerald-200");
code = code.replace(/bg-rose-50 border border-rose-300 text-rose-900/g, "bg-rose-950/80 border border-rose-500/40 text-rose-200");
code = code.replace(/bg-amber-50 border border-amber-200 text-xs text-amber-900/g, "bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200");

// Elements
code = code.replace(/bg-\[#0A1128\] hover:bg-slate-800 text-\[#D4AF37\]/g, "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30");
code = code.replace(/bg-\[#0A1128\] text-\[#D4AF37\]/g, "bg-amber-500/10 text-amber-400 border border-amber-500/20");
code = code.replace(/bg-\[#0A1128\] text-\[#E6C687\]/g, "bg-amber-500/20 text-amber-300 border border-amber-500/30");
code = code.replace(/bg-\[#FDFCF7\]/g, "bg-[#070b14]");
code = code.replace(/focus:border-\[#D4AF37\]/g, "focus:border-amber-400");
code = code.replace(/text-\[#996515\]/g, "text-amber-400");

fs.writeFileSync(filePath, code, "utf8");
console.log("Successfully restyled app/vendor/profile/page.tsx to luxury dark theme!");
