import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/mainpage/Navbar"; 

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
    <html lang="en" className="dark">
      {/* Changed bg-background to bg-black to prevent the "grey vs black" seam */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-black text-foreground`}>
        <Navbar />
        {/* 'flex-grow' ensures this fills all space below the navbar */}
        <main className="grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}