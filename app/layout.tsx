import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { contentSecurityPolicy } from "@/lib/csp.mjs";
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
  description:
    "Colección de herramientas web rápidas, gratuitas y fáciles de usar para mejorar tu productividad y resolver tareas comunes en segundos.",
  metadataBase: new URL("https://herramientaswebsencillas.github.io"),
  // GitHub Pages no permite la cabecera Referrer-Policy, pero la etiqueta
  // <meta> equivalente sí funciona: a otros sitios solo llega el origen.
  referrer: "strict-origin-when-cross-origin",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://herramientaswebsencillas.github.io",
    siteName: "Herramientas Web Sencillas",
    // La imagen sale de app/opengraph-image.png (y su .alt.txt), que Next.js
    // añade sola a todas las páginas.
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // La CSP (lib/csp.mjs) solo se renderiza aquí en desarrollo. En lo
  // publicado la inserta scripts/csp-hashes.mjs al principio del <head> de
  // cada página, con los hashes de sus scripts inline en lugar de
  // 'unsafe-inline'. React no puede renderizar esa versión: el payload de
  // hidratación incluye el <head>, así que meter los hashes en el <meta>
  // cambiaría los mismos scripts de los que se calculan.
  const devCsp =
    process.env.NODE_ENV === "development" ? contentSecurityPolicy(["'unsafe-inline'"]) : null;

  return (
    <html lang="es">
      <head>{devCsp && <meta httpEquiv="Content-Security-Policy" content={devCsp} />}</head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
