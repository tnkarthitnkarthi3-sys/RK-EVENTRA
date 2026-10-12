import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "app/vendors/[id]/page.tsx");
let code = fs.readFileSync(filePath, "utf8");

// Root & Breadcrumb
code = code.replace(/bg-\[#FAF9F6\]/g, "bg-[#070b14]");
code = code.replace(/text-\[#0F172A\]/g, "text-slate-100");
code = code.replace(/border-b border-stone-200 bg-white/g, "border-b border-slate-800 bg-[#070b14]");
code = code.replace(/bg-gradient-to-b from-\[#0A1128\] via-\[#0E1A38\] to-\[#12224A\]/g, "bg-gradient-to-b from-[#0b1329] via-[#070b14] to-[#070b14]");
code = code.replace(/border-\[#D4AF37\]\/20/g, "border-amber-500/20");
code = code.replace(/bg-\[#D4AF37\]\/15 text-\[#E6C687\]/g, "bg-amber-500/15 text-amber-300");
code = code.replace(/text-\[#D4AF37\]/g, "text-amber-400");
code = code.replace(/text-\[#E6C687\]/g, "text-amber-300");
code = code.replace(/text-\[#996515\]/g, "text-amber-400");
code = code.replace(/bg-\[#D4AF37\]/g, "bg-amber-500");
code = code.replace(/bg-white\/10/g, "bg-[#0e172e]/80");

// Cards & Surfaces
code = code.replace(/bg-white rounded-3xl/g, "bg-[#0e172e]/80 rounded-3xl");
code = code.replace(/bg-white rounded-2xl/g, "bg-[#0e172e]/80 rounded-2xl");
code = code.replace(/bg-white p-6/g, "bg-[#0e172e]/80 p-6");
code = code.replace(/bg-\[#FDFCF7\]/g, "bg-[#070b14]");
code = code.replace(/bg-stone-50/g, "bg-[#070b14]");
code = code.replace(/bg-stone-100/g, "bg-slate-800");

// Borders
code = code.replace(/border-stone-200/g, "border-slate-800");
code = code.replace(/border-stone-300/g, "border-slate-700");
code = code.replace(/border-stone-100/g, "border-slate-800");

// Text Colors
code = code.replace(/text-stone-900/g, "text-white");
code = code.replace(/text-stone-800/g, "text-slate-200");
code = code.replace(/text-stone-700/g, "text-slate-300");
code = code.replace(/text-stone-600/g, "text-slate-300");
code = code.replace(/text-stone-500/g, "text-slate-400");
code = code.replace(/text-stone-400/g, "text-slate-500");
code = code.replace(/text-stone-300/g, "text-slate-600");

fs.writeFileSync(filePath, code, "utf8");
console.log("Successfully restyled app/vendors/[id]/page.tsx to luxury dark theme!");
