/* Conversión entre Base64, bytes y texto UTF-8, compartida por el convertidor
   Base64, el conversor de archivos y el encriptador.

   btoa y atob trabajan con "cadenas binarias" (un carácter por byte), así que
   el texto pasa antes por TextEncoder/TextDecoder. Antes se hacía con
   unescape(encodeURIComponent(…)) y escape(), que están deprecados. */

export function bytesToBase64(bytes: Uint8Array): string {
  // Por bloques: String.fromCharCode(...bytes) desborda la pila con textos largos.
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

/** Lanza si el texto no es Base64 válido (lo hace atob). */
export function base64ToBytes(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function textToBase64(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text));
}

/** Lanza si el texto no es Base64 válido o los bytes no son UTF-8 válido. */
export function base64ToText(text: string): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(base64ToBytes(text));
}
