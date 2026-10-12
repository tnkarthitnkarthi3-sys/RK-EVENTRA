import type { Metadata } from "next";
import "./globals.css";
import RKFloatingAssistant from "@/src/components/ai/RKFloatingAssistant";
import { ThemeProvider } from "@/src/components/theme/ThemeProvider";
import ThemeToggle from "@/src/components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "RK Eventra — Your Event. Your Choice. Your Celebration.",
  description: "AI-Powered Event Booking Marketplace connecting customers with verified DJs, Sound, Lighting, Catering, Decorators, and Photography.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem("rk_theme");
                if (saved === "light") {
                  document.documentElement.classList.remove("dark");
                  document.documentElement.classList.add("light");
                  document.documentElement.setAttribute("data-theme", "light");
                  document.documentElement.style.colorScheme = "light";
                } else {
                  document.documentElement.classList.add("dark");
                  document.documentElement.classList.remove("light");
                  document.documentElement.setAttribute("data-theme", "dark");
                  document.documentElement.style.colorScheme = "dark";
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300">
        <ThemeProvider>
          {children}
          <RKFloatingAssistant />
          <ThemeToggle variant="floating" />
        </ThemeProvider>
      </body>
    </html>
  );
}
