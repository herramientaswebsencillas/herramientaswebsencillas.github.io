/* Guía estática: las voces de "texto a voz" las aporta el sistema operativo
   (o el propio navegador), no esta página. Aquí se explica cómo añadir más. */

const summaryClass =
  "cursor-pointer select-none px-5 py-3.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors marker:text-slate-400";
const bodyClass =
  "px-5 pb-5 pt-3 text-sm text-slate-600 space-y-3 border-t border-slate-100";
const listClass = "list-decimal list-outside ml-5 space-y-1.5";
const noteClass = "text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[0.8em] font-mono text-slate-700">
      {children}
    </code>
  );
}

export default function VoiceInstallGuide() {
  return (
    <section className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 p-4">
        <h2 className="text-white font-semibold flex items-center gap-2">
          📖 ¿No aparece tu idioma? Cómo instalar más voces
        </h2>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-sm text-slate-600">
          El listado de voces lo aporta tu sistema operativo y tu navegador,
          por eso cambia de un equipo a otro. Tras instalar una voz nueva hay
          que <strong>cerrar y volver a abrir el navegador</strong>: las voces
          se detectan al arrancar, no en caliente.
        </p>

        <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="font-semibold mb-1">Atajo: voces sin instalar nada</p>
          <p>
            <strong>Microsoft Edge</strong> incluye las voces{" "}
            <em>Microsoft … Online (Natural)</em> y <strong>Chrome</strong> las
            voces <em>Google</em>, en decenas de idiomas y con mejor calidad
            que las voces clásicas del sistema. Funcionan al instante, pero
            necesitan conexión a internet porque se generan en los servidores
            del navegador.
          </p>
        </div>

        <div className="space-y-3">
          {/* ------------------------------ Windows ------------------------------ */}
          <details className="border border-slate-200 rounded-xl overflow-hidden">
            <summary className={summaryClass}>Windows 10 y 11</summary>
            <div className={bodyClass}>
              <ol className={listClass}>
                <li>
                  Abre <strong>Configuración</strong> → <strong>Hora e idioma</strong>{" "}
                  → <strong>Voz</strong>. (Atajo: pulsa <Code>Win + R</Code> y
                  escribe <Code>ms-settings:speech</Code>).
                </li>
                <li>
                  En <strong>Administrar voces</strong>, pulsa{" "}
                  <strong>Agregar voces</strong>, busca el idioma que necesitas
                  y confirma con <strong>Agregar</strong>.
                </li>
                <li>
                  Si esa opción no aparece, ve a <strong>Hora e idioma</strong> →{" "}
                  <strong>Idioma</strong> → <strong>Agregar un idioma</strong>, elige
                  el idioma y deja marcada la característica opcional{" "}
                  <strong>Voz</strong> o <strong>Texto a voz</strong>.
                </li>
                <li>Reinicia el navegador y recarga esta página.</li>
              </ol>
              <p className={noteClass}>
                En las ediciones <em>Single Language</em> no podrás cambiar el
                idioma de la interfaz, pero sí instalar solo el componente de
                voz. Ten en cuenta también que algunas voces quedan registradas
                únicamente en el motor moderno que usa el Narrador y Chrome no
                llega a verlas: si te ocurre, prueba la misma voz desde Edge.
              </p>
            </div>
          </details>

          {/* ------------------------------- macOS ------------------------------- */}
          <details className="border border-slate-200 rounded-xl overflow-hidden">
            <summary className={summaryClass}>macOS</summary>
            <div className={bodyClass}>
              <ol className={listClass}>
                <li>
                  Abre <strong>Ajustes del Sistema</strong> →{" "}
                  <strong>Accesibilidad</strong> →{" "}
                  <strong>Contenido hablado</strong>. (En versiones anteriores:{" "}
                  <strong>Preferencias del Sistema</strong> →{" "}
                  <strong>Accesibilidad</strong> → <strong>Habla</strong>).
                </li>
                <li>
                  Junto a <strong>Voz del sistema</strong>, elige{" "}
                  <strong>Gestionar voces…</strong>
                </li>
                <li>
                  Marca los idiomas que quieras y espera la descarga. Las voces{" "}
                  <em>Mejorada</em> y <em>Premium</em> ocupan bastante más, pero
                  suenan mucho mejor que las básicas.
                </li>
                <li>Reinicia el navegador y recarga esta página.</li>
              </ol>
              <p className={noteClass}>
                Safari y Chrome comparten las voces del sistema, así que basta
                con instalarlas una vez.
              </p>
            </div>
          </details>

          {/* ------------------------------ Android ------------------------------ */}
          <details className="border border-slate-200 rounded-xl overflow-hidden">
            <summary className={summaryClass}>Android</summary>
            <div className={bodyClass}>
              <ol className={listClass}>
                <li>
                  Abre <strong>Ajustes</strong> →{" "}
                  <strong>Accesibilidad</strong> →{" "}
                  <strong>Salida de texto a voz</strong>. Según la marca puede
                  estar en <strong>Ajustes</strong> → <strong>Sistema</strong> →{" "}
                  <strong>Idiomas e introducción</strong>.
                </li>
                <li>
                  Con <strong>Servicios de voz de Google</strong> como motor
                  preferido, toca el <strong>engranaje</strong> que aparece a su
                  derecha.
                </li>
                <li>
                  Entra en <strong>Instalar datos de voz</strong>, elige el
                  idioma y descarga la voz.
                </li>
                <li>Cierra por completo Chrome y vuelve a abrir esta página.</li>
              </ol>
            </div>
          </details>

          {/* ---------------------------- iOS / iPadOS ---------------------------- */}
          <details className="border border-slate-200 rounded-xl overflow-hidden">
            <summary className={summaryClass}>iOS y iPadOS</summary>
            <div className={bodyClass}>
              <ol className={listClass}>
                <li>
                  Abre <strong>Ajustes</strong> →{" "}
                  <strong>Accesibilidad</strong> →{" "}
                  <strong>Contenido hablado</strong> → <strong>Voces</strong>.
                </li>
                <li>
                  Elige el idioma y descarga la voz que prefieras (las{" "}
                  <em>Mejorada</em> y <em>Premium</em> tienen mejor calidad).
                </li>
                <li>Vuelve al navegador y recarga esta página.</li>
              </ol>
              <p className={noteClass}>
                En iPhone y iPad todos los navegadores usan el motor de Safari,
                así que las voces del sistema valen para cualquiera de ellos.
              </p>
            </div>
          </details>

          {/* ------------------------------- Linux ------------------------------- */}
          <details className="border border-slate-200 rounded-xl overflow-hidden">
            <summary className={summaryClass}>Linux</summary>
            <div className={bodyClass}>
              <ol className={listClass}>
                <li>
                  Chrome y Chromium leen las voces a través de{" "}
                  <strong>speech-dispatcher</strong>. En Debian o Ubuntu:{" "}
                  <Code>sudo apt install speech-dispatcher espeak-ng</Code>. En
                  Fedora: <Code>sudo dnf install speech-dispatcher espeak-ng</Code>.
                </li>
                <li>
                  Comprueba que funciona con{" "}
                  <Code>spd-say -l</Code> para ver los idiomas disponibles.
                </li>
                <li>
                  Para voces más naturales que las de <em>espeak</em>, instala{" "}
                  <Code>mbrola</Code> con su paquete de idioma, o un motor
                  moderno como <em>Piper</em>.
                </li>
                <li>Reinicia el navegador y recarga esta página.</li>
              </ol>
              <p className={noteClass}>
                Firefox no expone voces de texto a voz en Linux, así que usa
                Chrome, Chromium o Edge para esta herramienta.
              </p>
            </div>
          </details>
        </div>

        <p className="text-xs text-slate-400">
          Los nombres exactos de los menús cambian según la versión de cada
          sistema. Si una voz recién instalada no aparece en el selector,
          reinicia el navegador por completo antes de darla por perdida.
        </p>
      </div>
    </section>
  );
}
