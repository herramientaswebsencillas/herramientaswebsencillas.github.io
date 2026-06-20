import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Herramientas Web Sencillas",
    template: "%s | Herramientas Web Sencillas",
  },
  description: "Colección de herramientas web rápidas, gratuitas y fáciles de usar para mejorar tu productividad y resolver tareas comunes en segundos.",
  metadataBase: new URL('https://herramientaswebsencillas.github.io'),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://herramientaswebsencillas.github.io",
    siteName: "Herramientas Web Sencillas",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Herramientas Web Sencillas",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}