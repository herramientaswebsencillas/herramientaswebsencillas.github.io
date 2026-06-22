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
  // CSP vía <meta> porque GitHub Pages no permite configurar cabeceras HTTP.
  // Es un "fix parcial": cubre XSS/inyección de recursos, pero a diferencia
  // de una cabecera real no puede aplicar frame-ancestors, X-Frame-Options
  // ni reportar violaciones (report-uri). Si esto es crítico, lo correcto
  // es migrar a un host que sí sirva headers (Vercel, Cloudflare Pages, Netlify).
  const csp = [
    "default-src 'self'",
    // Next.js inyecta JS inline para hidratación; 'unsafe-inline' es necesario
    // en un sitio estático sin nonces dinámicos (no hay servidor para generarlos).
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    // Fuentes de next/font/google quedan auto-hospedadas en build, no se llaman
    // a fonts.googleapis.com/fonts.gstatic.com en runtime.
    "font-src 'self'",
    "img-src 'self' data:",
    // Dominios de las APIs públicas usadas por proofreader y translator.
    "connect-src 'self' https://api.languagetool.org https://api.mymemory.translated.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  return (
    <html lang="es">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}