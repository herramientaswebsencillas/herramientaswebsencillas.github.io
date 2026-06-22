import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca de este sitio",
  description:
    "Conoce qué es Herramientas Web Sencillas: una colección de utilidades web gratuitas, rápidas y fáciles de usar.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
            Acerca de este sitio
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Herramientas Web Sencillas es una colección gratuita de utilidades
            en línea pensadas para resolver tareas comunes en segundos:
            calculadoras, generadores, convertidores y herramientas para
            manejo de archivos, todo en una sola página, sin registros ni
            instalaciones, y siempre accesible desde el navegador.
          </p>

          <p className="text-slate-600 text-base leading-relaxed mt-4">
            Este es un proyecto de código abierto. Si quieres revisar el
            código, reportar un error o proponer una nueva herramienta,
            puedes visitar el{' '}
            <a
              href="https://github.com/herramientaswebsencillas/herramientaswebsencillas.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
            >
              repositorio en GitHub
            </a>
            . Las contribuciones son bienvenidas: cualquiera puede crear una
            rama, añadir una herramienta nueva dentro de{' '}
            <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-sm">
              app/tools/
            </code>{' '}
            y enviar un pull request.
          </p>
        </div>
      </div>
    </main>
  );
}
