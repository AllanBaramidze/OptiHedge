import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/mainpage/Navbar"; 

// 1. Initialize the font constants
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OptiHedge | AI Portfolio Analysis",
  description: "Advanced portfolio analysis and hedging for retail traders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-black text-foreground`}>
        {/* 2. The Navbar is imported and used here */}
        <Navbar />
        
        <main className="grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}