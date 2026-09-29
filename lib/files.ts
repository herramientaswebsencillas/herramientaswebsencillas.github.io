/* Utilidades compartidas por las herramientas que procesan archivos en el
   navegador (PDF y Base64): límites de tamaño, decodificación de Base64 y
   descarga del resultado. */

const MB = 1024 * 1024;

// Todo se procesa en memoria dentro de la pestaña. Por encima de estos
// tamaños el navegador puede congelarse o cerrar la pestaña, así que se
// rechaza el archivo con un mensaje en lugar de intentarlo.
export const MAX_PDF_BYTES = 50 * MB;
// El resultado en Base64 ocupa 4/3 del archivo y se muestra en un <textarea>,
// que se vuelve inmanejable mucho antes que un PDF del mismo tamaño.
export const MAX_BASE64_FILE_BYTES = 10 * MB;

export class FileToolError extends Error {}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / MB).toFixed(bytes < 10 * MB ? 1 : 0)} MB`;
}

/** Lanza FileToolError si algún archivo supera el límite, citando cuál. */
export function assertMaxSize(files: Iterable<{ name: string; size: number }>, max: number) {
  for (const file of files) {
    if (file.size > max) {
      const size = formatBytes(file.size);
      const limit = formatBytes(max);
      // Justo por encima del límite ambos redondean igual ("10 MB"); decir
      // "pesa 10 MB; el máximo es 10 MB" confunde, así que se omite el peso.
      const detail = size === limit ? "" : ` (pesa ${size})`;
      throw new FileToolError(`"${file.name}" supera el máximo de ${limit}${detail}.`);
    }
  }
}

export interface DecodedFile {
  bytes: Uint8Array<ArrayBuffer>;
  mimeType: string;
}

// data:[<tipo>/<subtipo>][;param=valor]*;base64,<datos>
const DATA_URL = /^data:([\w.+-]+\/[\w.+-]+)?((?:;[\w.+-]+=[^;,]*)*);base64,/i;
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;
// Tipos que el navegador interpreta como documento y en los que puede correr
// un script: HTML, XHTML, SVG y cualquier XML.
const ACTIVE_TYPE = /^(text\/html|application\/xhtml\+xml|image\/svg\+xml|(text|application)\/xml|[\w.-]+\/[\w.-]+\+xml)$/;

/**
 * Decodifica Base64 puro o un data URL con Base64 a bytes.
 *
 * La entrada nunca se usa como URL: antes se asignaba tal cual al href de un
 * enlace, y un texto como "javascript:…" ejecutaba código en el sitio. Ahora
 * solo se aceptan caracteres Base64 y el archivo se reconstruye como Blob.
 *
 * El tipo lo declara quien pega el texto. Los tipos activos (HTML, SVG, XML)
 * se entregan como application/octet-stream: el enlace de descarga lleva
 * `download` y el navegador no debería abrirlos, pero si alguno lo hiciera,
 * el Blob se abriría con el origen del sitio. El archivo descargado es el
 * mismo; solo cambia cómo lo etiqueta el navegador.
 */
export function decodeBase64File(input: string): DecodedFile {
  let text = input.trim();
  let mimeType = "application/octet-stream";

  const header = DATA_URL.exec(text);
  if (header) {
    const declared = header[1]?.toLowerCase();
    if (declared && !ACTIVE_TYPE.test(declared)) mimeType = declared;
    text = text.slice(header[0].length);
  } else if (/^[a-z][\w+.-]*:/i.test(text)) {
    throw new FileToolError(
      "Solo se aceptan datos Base64, solos o con la cabecera \"data:tipo/subtipo;base64,\"."
    );
  }

  const payload = text.replace(/\s+/g, "");
  if (!payload) throw new FileToolError("Pega el código Base64 del archivo.");
  if (!BASE64.test(payload) || payload.length % 4 === 1) {
    throw new FileToolError("El código Base64 no es válido: tiene caracteres fuera del alfabeto o está incompleto.");
  }

  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, mimeType };
}

/** Descarga un Blob con el nombre indicado. Solo en el navegador. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revocar en la misma tarea que el click puede cancelar la descarga en
  // algunos navegadores; se deja un margen amplio.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
