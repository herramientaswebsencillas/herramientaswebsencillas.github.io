import CryptoJS from "crypto-js";
import { describe, expect, it } from "vitest";
import { CIPHER_PREFIX, CipherError, decryptText, detectFormat, encryptText } from "./cipher";

const MESSAGE = "¡Hola, ñandú! Texto con acentos y emoji 🔐\nen dos líneas.";
const PASS = "una frase secreta larga";

describe("formato actual (AES-256-GCM)", () => {
  it("cifra y descifra de ida y vuelta", async () => {
    const cipher = await encryptText(MESSAGE, PASS);
    expect(cipher.startsWith(CIPHER_PREFIX)).toBe(true);
    expect(detectFormat(cipher)).toBe("current");
    await expect(decryptText(cipher, PASS)).resolves.toBe(MESSAGE);
  });

  it("usa sal e IV nuevos en cada cifrado", async () => {
    const [a, b] = await Promise.all([encryptText(MESSAGE, PASS), encryptText(MESSAGE, PASS)]);
    expect(a).not.toBe(b);
  });

  it("tolera espacios alrededor al pegar el texto cifrado", async () => {
    const cipher = await encryptText("hola", PASS);
    await expect(decryptText(`  ${cipher}\n`, PASS)).resolves.toBe("hola");
  });

  it("falla con una frase incorrecta", async () => {
    const cipher = await encryptText(MESSAGE, PASS);
    await expect(decryptText(cipher, "otra frase")).rejects.toBeInstanceOf(CipherError);
  });

  it("detecta un texto cifrado alterado", async () => {
    const cipher = await encryptText(MESSAGE, PASS);
    // Cambia un carácter del final (dentro del cifrado + tag, no del relleno).
    const i = cipher.length - 6;
    const tampered = cipher.slice(0, i) + (cipher[i] === "A" ? "B" : "A") + cipher.slice(i + 1);
    await expect(decryptText(tampered, PASS)).rejects.toBeInstanceOf(CipherError);
  });

  it("rechaza textos truncados o con base64 inválido", async () => {
    await expect(decryptText(`${CIPHER_PREFIX}AAAA`, PASS)).rejects.toBeInstanceOf(CipherError);
    await expect(decryptText(`${CIPHER_PREFIX}@@@`, PASS)).rejects.toBeInstanceOf(CipherError);
  });
});

describe("formato heredado (CryptoJS)", () => {
  it.each(["AES", "TripleDES", "Rabbit", "RC4"] as const)(
    "descifra textos de la versión anterior con %s",
    async (algorithm) => {
      const legacy = CryptoJS[algorithm].encrypt(MESSAGE, PASS).toString();
      expect(detectFormat(legacy)).toBe("legacy");
      await expect(decryptText(legacy, PASS, algorithm)).resolves.toBe(MESSAGE);
    }
  );

  it("falla con la frase equivocada", async () => {
    const legacy = CryptoJS.AES.encrypt(MESSAGE, PASS).toString();
    await expect(decryptText(legacy, "otra frase", "AES")).rejects.toBeInstanceOf(CipherError);
  });
});

describe("validación de entradas", () => {
  it("exige texto y frase", async () => {
    await expect(encryptText("", PASS)).rejects.toBeInstanceOf(CipherError);
    await expect(encryptText(MESSAGE, "")).rejects.toBeInstanceOf(CipherError);
    await expect(decryptText("   ", PASS)).rejects.toBeInstanceOf(CipherError);
    await expect(decryptText("v2:abc", "")).rejects.toBeInstanceOf(CipherError);
  });

  it("rechaza textos sin formato reconocible", async () => {
    expect(detectFormat("hola mundo")).toBe("unknown");
    await expect(decryptText("hola mundo", PASS)).rejects.toBeInstanceOf(CipherError);
  });
});
