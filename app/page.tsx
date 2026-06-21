import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
        <section>
          {/* Grid de Categorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">

            {/* Categoría: Calculadoras */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-purple-200"></span>
                Calculadoras
              </h3>
              <div className="space-y-4">
                <Link href="/tools/compound-interest-calculator" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 mb-1 transition-colors">
                    Calculadora de Interés Compuesto
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Herramienta para calcular el crecimiento del interés a lo largo del tiempo basado en la frecuencia, capital y tasa.
                  </p>
                </Link>
                <Link href="/tools/loan-calculator" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-purple-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 mb-1 transition-colors">
                    Calculadora de Préstamos
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Calcula tu cuota, compara sistemas de amortización y visualiza tu tabla de pagos incluyendo seguros u otros gastos.
                  </p>
                </Link>
              </div>
            </div>

            {/* Categoría: Manejo de Archivos */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-emerald-200"></span>
                Manejo de Archivos
              </h3>
              <div className="space-y-4">
                <Link href="/tools/pdf-page-splitter" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 mb-1 transition-colors">
                    Divisor de Páginas de PDF
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Segmenta archivos PDF en documentos individuales por página de manera segura.
                  </p>
                </Link>
                <Link href="/tools/pdf-merger" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 mb-1 transition-colors">
                    Unir PDF
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Combina múltiples archivos PDF en un solo documento de forma segura.
                  </p>
                </Link>
              </div>
            </div>

            {/* Categoría: Generadores */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-amber-200"></span>
                Generadores
              </h3>
              <div className="space-y-4">
                <Link href="/tools/random-string" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-amber-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 mb-1 transition-colors">
                    Generador de Texto Aleatorio
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Crea cadenas de texto, contraseñas seguras y secuencias de caracteres aleatorias al instante.
                  </p>
                </Link>
                <Link href="/tools/random-numbers" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-amber-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 mb-1 transition-colors">
                    Generador de Números Aleatorios
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Genera números al azar de forma gratuita. Configura rangos personalizados y evita repeticiones.
                  </p>
                </Link>
              </div>
            </div>

            {/* Categoría: Texto e Idioma — corrección, traducción de idiomas */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-rose-200"></span>
                Texto e Idioma
              </h3>
              <div className="space-y-4">
                <Link href="/tools/proofreader" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-rose-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 mb-1 transition-colors">
                    Corrector de Texto
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Corrige errores de ortografía y gramática en tu texto de forma rápida.
                  </p>
                </Link>
                <Link href="/tools/translator" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-rose-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 mb-1 transition-colors">
                    Traductor de Texto
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Traduce tu texto de un idioma a otro de forma rápida y sencilla.
                  </p>
                </Link>
              </div>
            </div>

            {/* Categoría: Convertidores — solo herramientas que transforman un formato/sistema en otro */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-blue-200"></span>
                Convertidores
              </h3>
              <div className="space-y-4">
                <Link href="/tools/base64-converter" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 mb-1 transition-colors">
                    Convertidor Base64
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Herramienta para convertir texto a codificación Base64 y viceversa de forma instantánea.
                  </p>
                </Link>
                <Link href="/tools/base64-file-converter" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 mb-1 transition-colors">
                    Convertidor de Archivos Base64
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Herramienta para convertir archivos a codificación Base64 y viceversa de forma instantánea.
                  </p>
                </Link>
                <Link href="/tools/text-to-binary" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 mb-1 transition-colors">
                    Convertidor de Texto a Binario
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Convierte texto a código binario y viceversa de forma rápida.
                  </p>
                </Link>
                <Link href="/tools/roman-converter" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 mb-1 transition-colors">
                    Convertidor de Números Romanos
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Convierte números decimales a romanos y viceversa de forma instantánea.
                  </p>
                </Link>
              </div>
            </div>

            {/* Categoría: Seguridad — cifrado, protección de datos */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-indigo-200"></span>
                Seguridad
              </h3>
              <div className="space-y-4">
                <Link href="/tools/text-encryptor" className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 mb-1 transition-colors">
                    Encriptador y Desencriptador de Texto
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Encripta y desencripta tu texto con un algoritmo de cifrado seguro y una frase secreta que elijas.
                  </p>
                </Link>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
