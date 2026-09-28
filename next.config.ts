import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  // Use the prefix for GitHub Pages
  basePath: '',
  assetPrefix: '/',
  // Rutas sin barra final (/tools/x → tools/x.html), como las ha servido
  // siempre el sitio publicado: cambiarlo alteraría las URL de los enlaces ya
  // compartidos, incluidos los de la calculadora de fechas.
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  experimental: {
    sri: {
      algorithm: 'sha256'
    }
  }
};

export default nextConfig;
