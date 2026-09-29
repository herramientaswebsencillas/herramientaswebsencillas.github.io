import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de uso",
  description:
    "Condiciones para usar Herramientas Web Sencillas: un servicio gratuito, sin garantías, cuyos resultados son orientativos.",
};

// Actualizar con cualquier cambio de fondo en estos términos.
const LAST_UPDATED = "29 de septiembre de 2026";

const REPO = "https://github.com/herramientaswebsencillas/herramientaswebsencillas.github.io";

const linkClass = "text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
      <div className="space-y-3 text-slate-600 text-base leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-surface rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
            Términos de uso
          </h1>

          <p className="text-slate-600 text-base leading-relaxed">
            Herramientas Web Sencillas es un sitio gratuito, sin registro, cuyo titular es Carlos
            Alberto. Al usarlo aceptas estos términos; si no estás de acuerdo con ellos, no uses el
            sitio.
          </p>

          <Section title="Sin garantías">
            <p>
              El sitio y sus herramientas se ofrecen «tal cual», sin garantía de ningún tipo. Pueden
              contener errores, cambiar o dejar de estar disponibles en cualquier momento. En la
              medida en que la ley lo permita, el titular no responde por daños o pérdidas derivados
              del uso del sitio o de sus resultados.
            </p>
          </Section>

          <Section title="Calculadoras y conversores">
            <p>
              Los resultados de las calculadoras de interés, préstamos y fechas, y del conversor de
              divisas, son orientativos. No son asesoría financiera, fiscal ni legal. Antes de tomar
              una decisión con ellos, verifícalos con la institución o el profesional que
              corresponda.
            </p>
            <p>
              Los tipos de cambio son de referencia, publicados por bancos centrales a través de
              Frankfurter, y pueden ser de días anteriores. No son los que aplica un banco o una
              casa de cambio en una operación real.
            </p>
          </Section>

          <Section title="Encriptador de texto">
            <p>
              El texto se cifra en tu navegador con la frase secreta que elijas. Si la olvidas, no
              hay forma de recuperar el contenido: nadie más la conoce ni la guarda. La protección
              depende de que la frase sea larga y difícil de adivinar, y de cómo compartas el texto
              y la frase. No uses la herramienta como única protección de información cuya
              exposición tendría consecuencias graves.
            </p>
          </Section>

          <Section title="Tus textos y archivos">
            <p>
              Eres responsable de lo que procesas con las herramientas y de tener derecho a usarlo.
              Las herramientas que funcionan en tu navegador no guardan nada. Las que usan un
              servicio externo se detallan en{" "}
              <Link href="/privacy" className={linkClass}>
                Privacidad
              </Link>
              .
            </p>
          </Section>

          <Section title="Servicios de terceros">
            <p>
              El corrector (LanguageTool), el traductor (MyMemory), el conversor de divisas
              (Frankfurter) y las herramientas de voz (el proveedor de tu navegador) dependen de
              servicios ajenos a este sitio, con sus propias condiciones, límites de uso y
              disponibilidad. Al usar esas herramientas también quedas sujeto a las condiciones de
              cada servicio.
            </p>
          </Section>

          <Section title="Uso aceptable">
            <p>
              No uses el sitio para actividades ilegales, para consultar los servicios externos de
              forma automatizada o masiva, ni para intentar dañar el sitio o a otras personas. Si
              encuentras un problema de seguridad, repórtalo de forma privada, como explica la{" "}
              <a
                href={`${REPO}/security/policy`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                política de seguridad
              </a>
              .
            </p>
          </Section>

          <Section title="Código abierto">
            <p>
              El código del sitio se publica con la{" "}
              <a
                href={`${REPO}/blob/main/LICENSE`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                licencia MIT
              </a>
              , que permite usarlo, modificarlo y distribuirlo conservando el aviso de copyright y
              la licencia.
            </p>
          </Section>

          <Section title="Cambios y contacto">
            <p>
              El titular puede cambiar o retirar herramientas y actualizar estos términos. La fecha
              de la última actualización aparece al final de esta página. Para cualquier duda, abre
              un issue en el{" "}
              <a
                href={`${REPO}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                repositorio del sitio
              </a>
              .
            </p>
          </Section>

          <p className="text-sm text-slate-400 mt-8">Última actualización: {LAST_UPDATED}.</p>
        </div>
      </div>
    </main>
  );
}
