import { describe, expect, it } from "vitest";
import {
  CIPHER_PREFIX,
  CipherError,
  LEGACY_FORMAT_MESSAGE,
  decryptText,
  detectFormat,
  encryptText,
  isWeakPassphrase,
} from "./cipher";
import { FIXED_MESSAGE, FIXED_PASSPHRASE, FIXED_V2, LEGACY_CRYPTOJS } from "./cipher.fixtures";

const MESSAGE = FIXED_MESSAGE;
const PASS = FIXED_PASSPHRASE;

describe("formato v2 (AES-256-GCM)", () => {
  it("descifra un texto cifrado fijo", async () => {
    expect(detectFormat(FIXED_V2)).toBe("current");
    await expect(decryptText(FIXED_V2, PASS)).resolves.toBe(MESSAGE);
  });

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
    await expect(decryptText(`  ${FIXED_V2}\n`, PASS)).resolves.toBe(MESSAGE);
  });

  it("falla con una frase incorrecta", async () => {
    await expect(decryptText(FIXED_V2, "otra frase")).rejects.toBeInstanceOf(CipherError);
  });

  it("detecta un texto cifrado alterado", async () => {
    // Cambia un carácter del final (dentro del cifrado + tag, no del relleno).
    const i = FIXED_V2.length - 6;
    const tampered =
      FIXED_V2.slice(0, i) + (FIXED_V2[i] === "A" ? "B" : "A") + FIXED_V2.slice(i + 1);
    await expect(decryptText(tampered, PASS)).rejects.toBeInstanceOf(CipherError);
  });

  it("rechaza textos truncados o con base64 inválido", async () => {
    await expect(decryptText(`${CIPHER_PREFIX}AAAA`, PASS)).rejects.toBeInstanceOf(CipherError);
    await expect(decryptText(`${CIPHER_PREFIX}@@@`, PASS)).rejects.toBeInstanceOf(CipherError);
  });
});

describe("formato anterior (CryptoJS)", () => {
  it("lo reconoce y explica que ya no se admite", async () => {
    expect(detectFormat(LEGACY_CRYPTOJS)).toBe("legacy");
    await expect(decryptText(LEGACY_CRYPTOJS, PASS)).rejects.toThrow(LEGACY_FORMAT_MESSAGE);
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

describe("isWeakPassphrase", () => {
  it.each(["1234", "secreto", "contraseña1", "123456789012345", "aaaaaaaaaaaaaa", "121212121212"])(
    "marca como débil %s",
    (passphrase) => {
      expect(isWeakPassphrase(passphrase)).toBe(true);
    }
  );

  it.each([PASS, "caballo batería grapa", "Tr0mb0n-azul-17"])("acepta %s", (passphrase) => {
    expect(isWeakPassphrase(passphrase)).toBe(false);
  });
});
