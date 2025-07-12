import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PDF AI Tools",
  description: "AI-powered PDF analysis tools using Google Gemini API. Chat with PDFs, generate summaries, translate content, and create questions.",
  keywords: ["PDF", "AI", "Gemini", "Chat", "Summary", "Translation", "Questions"],
  authors: [{ name: "Chirag Singhal", url: "https://github.com/chirag127" }],
  creator: "Chirag Singhal",
  openGraph: {
    title: "PDF AI Tools",
    description: "AI-powered PDF analysis tools using Google Gemini API",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased h-full bg-background text-foreground`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
