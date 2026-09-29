import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Qué datos salen de tu navegador al usar Herramientas Web Sencillas y a qué servicios llegan.",
};

// Actualizar al cambiar qué datos salen del navegador o hacia dónde.
const LAST_UPDATED = "28 de septiembre de 2026";

/* Mantener esta lista alineada con los dominios de connect-src en
   lib/csp.mjs, con los servicios que nombran los Términos de uso y con la tabla "Servicios externos" del README. */
const EXTERNAL_SERVICES = [
  {
    tool: "Corrector de texto",
    href: "/tools/proofreader",
    service: "LanguageTool",
    url: "https://languagetool.org/legal/privacy",
    data: "El texto que envías a revisar.",
  },
  {
    tool: "Traductor",
    href: "/tools/translator",
    service: "MyMemory",
    url: "https://mymemory.translated.net/terms-and-conditions",
    data: "El texto que traduces y el par de idiomas. MyMemory conserva los textos que recibe y puede usarlos para mejorar sus servicios, así que no traduzcas datos personales ni confidenciales.",
  },
  {
    tool: "Conversor de divisas",
    href: "/tools/currency-converter",
    service: "Frankfurter",
    url: "https://frankfurter.dev/",
    data: "Solo las monedas consultadas; nunca las cantidades.",
  },
  {
    tool: "Voz a texto",
    href: "/tools/speech-to-text",
    service: "El proveedor de tu navegador",
    data: "El audio del micrófono, en Chrome y Edge, que lo reconocen en sus servidores.",
  },
  {
    tool: "Texto a voz",
    href: "/tools/text-to-speech",
    service: "El proveedor de tu navegador",
    data: "El texto, solo si eliges una voz en línea (la herramienta lo indica).",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-surface rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Privacidad</h1>

          <div className="space-y-4 text-slate-600 text-base leading-relaxed">
            <p>
              Este sitio no tiene cuentas, no usa cookies ni herramientas de analítica y no guarda
              nada de lo que escribes o subes. Casi todas las herramientas funcionan por completo en
              tu navegador: los archivos PDF, los textos cifrados o convertidos y los números
              generados nunca salen de tu equipo.
            </p>
            <p>
              Las excepciones son las herramientas que necesitan un servicio externo. Solo envían
              datos cuando las usas, y directamente desde tu navegador al servicio, sin pasar por
              ningún servidor propio:
            </p>
          </div>

          <ul className="mt-6 divide-y divide-slate-100 border border-slate-100 rounded-xl">
            {EXTERNAL_SERVICES.map((item) => (
              <li key={item.href} className="p-4">
                <p className="text-slate-900 font-semibold">
                  <Link href={item.href} className="hover:text-blue-600">
                    {item.tool}
                  </Link>
                  <span className="text-slate-400 font-normal"> → </span>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
                    >
                      {item.service}
                    </a>
                  ) : (
                    <span className="font-medium">{item.service}</span>
                  )}
                </p>
                <p className="text-sm text-slate-500 mt-1">{item.data}</p>
              </li>
            ))}
          </ul>

          <p className="text-slate-600 text-base leading-relaxed mt-6">
            El sitio está alojado en GitHub Pages, que registra datos técnicos de cada visita, como
            la dirección IP, según la{" "}
            <a
              href="https://docs.github.com/es/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
            >
              declaración de privacidad de GitHub
            </a>
            .
          </p>

          <p className="text-slate-600 text-base leading-relaxed mt-4">
            El responsable del sitio es Carlos Alberto. Para cualquier duda sobre esta página, abre
            un issue en el{" "}
            <a
              href="https://github.com/herramientaswebsencillas/herramientaswebsencillas.github.io/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
            >
              repositorio del sitio
            </a>
            . Los problemas de seguridad se reportan de forma privada, como explica su{" "}
            <a
              href="https://github.com/herramientaswebsencillas/herramientaswebsencillas.github.io/security/policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
            >
              política de seguridad
            </a>
            . Las condiciones de uso del sitio están en{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
            >
              Términos de uso
            </Link>
            .
          </p>

          <p className="text-sm text-slate-400 mt-6">Última actualización: {LAST_UPDATED}.</p>
        </div>
      </div>
    </main>
  );
}
