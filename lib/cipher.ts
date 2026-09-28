/**
 * Cifrado de texto con frase secreta para el encriptador.
 *
 * Formato actual ("v2:"): AES-256-GCM con la Web Crypto API. La clave se
 * deriva de la frase con PBKDF2-SHA256 y una sal aleatoria; GCM autentica el
 * resultado, así que un texto alterado o una frase incorrecta fallan en vez de
 * devolver basura. El texto cifrado es "v2:" + base64(sal ‖ IV ‖ cifrado+tag).
 *
 * Formato heredado: lo que producía la versión anterior con CryptoJS
 * (EVP_BytesToKey con MD5 de una sola iteración, sin autenticación). Solo se
 * admite para descifrar, de modo que los textos ya compartidos sigan
 * abriéndose; crypto-js se carga bajo demanda para no pesar en la página.
 */

export const CIPHER_PREFIX = "v2:";
// Recomendación de OWASP para PBKDF2-HMAC-SHA256. Cambiarla rompe los textos
// ya cifrados: si hace falta subirla, se crea un prefijo "v3:".
export const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const TAG_BYTES = 16;

// Los cuatro algoritmos de CryptoJS emiten el mismo sobre ("Salted__" en
// base64), así que el algoritmo no se puede deducir del texto: lo elige quien
// descifra.
export const LEGACY_ALGORITHMS = ["AES", "TripleDES", "Rabbit", "RC4"] as const;
export type LegacyAlgorithm = (typeof LEGACY_ALGORITHMS)[number];
const LEGACY_MARKER = "U2FsdGVkX1";

export type CipherFormat = "current" | "legacy" | "unknown";

export class CipherError extends Error {}

export function detectFormat(cipherText: string): CipherFormat {
  const text = cipherText.trim();
  if (text.startsWith(CIPHER_PREFIX)) return "current";
  if (text.startsWith(LEGACY_MARKER)) return "legacy";
  return "unknown";
}

function toBase64(bytes: Uint8Array): string {
  // Por bloques: String.fromCharCode(...bytes) desborda la pila con textos largos.
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptText(text: string, passphrase: string): Promise<string> {
  if (!text) throw new CipherError("Ingresa un texto para encriptar.");
  if (!passphrase) throw new CipherError("Ingresa una frase secreta.");

  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text))
  );

  const payload = new Uint8Array(SALT_BYTES + IV_BYTES + encrypted.length);
  payload.set(salt);
  payload.set(iv, SALT_BYTES);
  payload.set(encrypted, SALT_BYTES + IV_BYTES);
  return CIPHER_PREFIX + toBase64(payload);
}

export async function decryptText(
  cipherText: string,
  passphrase: string,
  legacyAlgorithm: LegacyAlgorithm = "AES"
): Promise<string> {
  const text = cipherText.trim();
  if (!text) throw new CipherError("Ingresa un texto para desencriptar.");
  if (!passphrase) throw new CipherError("Ingresa una frase secreta.");

  switch (detectFormat(text)) {
    case "current":
      return decryptCurrent(text.slice(CIPHER_PREFIX.length), passphrase);
    case "legacy":
      return decryptLegacy(text, passphrase, legacyAlgorithm);
    default:
      throw new CipherError("El texto no tiene un formato encriptado reconocible.");
  }
}

async function decryptCurrent(encoded: string, passphrase: string): Promise<string> {
  let payload: Uint8Array<ArrayBuffer>;
  try {
    payload = fromBase64(encoded);
  } catch {
    throw new CipherError("El texto encriptado está dañado o incompleto.");
  }
  if (payload.length < SALT_BYTES + IV_BYTES + TAG_BYTES) {
    throw new CipherError("El texto encriptado está dañado o incompleto.");
  }

  const salt = payload.subarray(0, SALT_BYTES);
  const iv = payload.subarray(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const key = await deriveKey(passphrase, salt);
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      payload.subarray(SALT_BYTES + IV_BYTES)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    // GCM no distingue entre frase incorrecta y texto alterado.
    throw new CipherError(
      "No se pudo desencriptar. Verifica la frase secreta y que el texto esté completo."
    );
  }
}

async function decryptLegacy(
  cipherText: string,
  passphrase: string,
  algorithm: LegacyAlgorithm
): Promise<string> {
  const { default: CryptoJS } = await import("crypto-js");
  let result: string;
  try {
    result = CryptoJS[algorithm].decrypt(cipherText, passphrase).toString(CryptoJS.enc.Utf8);
  } catch {
    // UTF-8 inválido: casi siempre frase o algoritmo equivocados.
    result = "";
  }
  if (!result) {
    throw new CipherError(
      "No se pudo desencriptar. Verifica la frase secreta y el algoritmo."
    );
  }
  return result;
}
