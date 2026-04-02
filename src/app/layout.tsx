import type { Metadata } from "next";
import { Newsreader, Outfit, Fira_Code } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { seedDatabase } from "@/lib/db/seed";
import "./globals.css";

// Seed database on first load
seedDatabase().catch(() => {});

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Reading Journal",
  description: "Your personal AI-powered reading journal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${outfit.variable} ${firaCode.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background">
        <ThemeProvider>
          <Sidebar />
          <main className="pl-[260px] min-h-screen transition-all duration-300">
            <div className="mx-auto max-w-7xl px-6 py-8">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
