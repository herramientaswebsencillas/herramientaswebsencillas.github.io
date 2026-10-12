/**
 * Cifrado de texto con frase secreta para el encriptador.
 *
 * Formato ("v2:"): AES-256-GCM con la Web Crypto API. La clave se deriva de la
 * frase con PBKDF2-SHA256 y una sal aleatoria; GCM autentica el resultado, así
 * que un texto alterado o una frase incorrecta fallan en vez de devolver
 * basura. El texto cifrado es "v2:" + base64(sal ‖ IV ‖ cifrado+tag).
 *
 * El formato anterior, de CryptoJS (EVP_BytesToKey con MD5 de una sola
 * iteración, sin autenticación), ya no se descifra. Solo se reconoce para
 * explicar por qué no se puede abrir.
 */

import { base64ToBytes, bytesToBase64 } from "./base64";

export const CIPHER_PREFIX = "v2:";
// Recomendación de OWASP para PBKDF2-HMAC-SHA256. Cambiarla rompe los textos
// ya cifrados: si hace falta subirla, se crea un prefijo "v3:". La prueba con
// un texto cifrado fijo de lib/cipher.test.ts lo detecta.
export const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const TAG_BYTES = 16;

// Así empiezan los textos de CryptoJS: "Salted__" en base64.
const LEGACY_MARKER = "U2FsdGVkX1";

export type CipherFormat = "current" | "legacy" | "unknown";

export class CipherError extends Error {}

export const LEGACY_FORMAT_MESSAGE =
  "Este texto se encriptó con una versión anterior de la herramienta, que ya no se admite.";

export const MIN_PASSPHRASE_LENGTH = 12;

/**
 * Si la frase es fácil de adivinar por fuerza bruta: corta, solo dígitos o
 * con muy pocos caracteres distintos ("aaaaaaaaaaaa", "121212121212").
 * PBKDF2 encarece cada intento, pero un texto cifrado interceptado se puede
 * atacar sin límite de tiempo, así que una frase como "1234" cae en segundos.
 *
 * Solo sirve para avisar: no se impide cifrar, y varias palabras en minúsculas
 * cuentan como frase fuerte, que es justo lo que conviene recomendar.
 */
export function isWeakPassphrase(passphrase: string): boolean {
  const chars = [...passphrase];
  return (
    chars.length < MIN_PASSPHRASE_LENGTH || /^\d+$/.test(passphrase) || new Set(chars).size < 5
  );
}

export function detectFormat(cipherText: string): CipherFormat {
  const text = cipherText.trim();
  if (text.startsWith(CIPHER_PREFIX)) return "current";
  if (text.startsWith(LEGACY_MARKER)) return "legacy";
  return "unknown";
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
  return CIPHER_PREFIX + bytesToBase64(payload);
}

export async function decryptText(cipherText: string, passphrase: string): Promise<string> {
  const text = cipherText.trim();
  if (!text) throw new CipherError("Ingresa un texto para desencriptar.");
  if (!passphrase) throw new CipherError("Ingresa una frase secreta.");

  switch (detectFormat(text)) {
    case "current":
      return decryptCurrent(text.slice(CIPHER_PREFIX.length), passphrase);
    case "legacy":
      throw new CipherError(LEGACY_FORMAT_MESSAGE);
    default:
      throw new CipherError("El texto no tiene un formato encriptado reconocible.");
  }
}

async function decryptCurrent(encoded: string, passphrase: string): Promise<string> {
  let payload: Uint8Array<ArrayBuffer>;
  try {
    payload = base64ToBytes(encoded);
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
