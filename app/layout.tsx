import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { contentSecurityPolicy } from "@/lib/csp.mjs";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/site";
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
  // Los del inicio. Cada página define los suyos con pageMetadata.
  ...pageMetadata({ path: "/", description: SITE_DESCRIPTION }),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  metadataBase: new URL(SITE_URL),
  // GitHub Pages no permite la cabecera Referrer-Policy, pero la etiqueta
  // <meta> equivalente sí funciona: a otros sitios solo llega el origen.
  referrer: "strict-origin-when-cross-origin",
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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>{devCsp && <meta httpEquiv="Content-Security-Policy" content={devCsp} />}</head>
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
