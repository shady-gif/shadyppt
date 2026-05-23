import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-editorial",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-editorial-body",
});

export const metadata: Metadata = {
  title: "DeckForge",
  description: "Create polished presentations from structured slide content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
