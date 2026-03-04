import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Professional branding for SEO and browser tabs
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
    // Added "dark" class if you are using Tailwind's dark mode by default
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        {/* Render the Navbar globally at the top of every page */}
        <Navbar />
        
        {/* Main content area grows to fill the remaining screen space */}
        <main className="grow">
          {children}
        </main>
      </body>
    </html>
  );
}