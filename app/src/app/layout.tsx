import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GeniusHR - Gestione HR per Studi Odontoiatrici",
  description: "Il primo software HR specifico per studi dentistici. Compliance CCNL, GDPR, sicurezza D.Lgs 81/2008.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
