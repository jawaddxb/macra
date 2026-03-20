import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MACRA — Live Global Behavioral Demand Simulator",
  description: "Feed it a news event. Watch the world respond.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-bg text-text-secondary antialiased`}>
        {children}
      </body>
    </html>
  );
}
