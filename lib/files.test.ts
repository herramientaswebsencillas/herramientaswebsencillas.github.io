import { describe, expect, it } from "vitest";
import {
  FileToolError,
  MAX_PDF_BYTES,
  assertMaxSize,
  decodeBase64File,
  formatBytes,
} from "./files";

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

describe("decodeBase64File", () => {
  it("decodifica un data URL y conserva el tipo", () => {
    const { bytes, mimeType } = decodeBase64File("data:text/plain;base64,aG9sYQ==");
    expect(text(bytes)).toBe("hola");
    expect(mimeType).toBe("text/plain");
  });

  it("acepta parámetros en la cabecera y espacios o saltos de línea en los datos", () => {
    const { bytes, mimeType } = decodeBase64File(
      "  data:text/plain;charset=utf-8;base64,aG9s\nYQ==  "
    );
    expect(text(bytes)).toBe("hola");
    expect(mimeType).toBe("text/plain");
  });

  it("acepta Base64 puro, con o sin relleno", () => {
    expect(text(decodeBase64File("aG9sYQ==").bytes)).toBe("hola");
    expect(text(decodeBase64File("aG9sYQ").bytes)).toBe("hola");
    expect(decodeBase64File("aG9sYQ==").mimeType).toBe("application/octet-stream");
  });

  it.each([
    "text/html",
    "application/xhtml+xml",
    "image/svg+xml",
    "text/xml",
    "application/xml",
    "application/rss+xml",
  ])("entrega %s como binario para que el navegador no lo interprete", (type) => {
    const { bytes, mimeType } = decodeBase64File(`data:${type};base64,PGI+eDwvYj4=`);
    expect(text(bytes)).toBe("<b>x</b>");
    expect(mimeType).toBe("application/octet-stream");
  });

  it("conserva los tipos inertes", () => {
    expect(decodeBase64File("data:application/pdf;base64,JVBERg==").mimeType).toBe("application/pdf");
    expect(decodeBase64File("data:image/png;base64,iVBORw==").mimeType).toBe("image/png");
  });

  it.each([
    "javascript:alert(document.domain)",
    "JavaScript:alert(1)",
    "https://example.com/malware.exe",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
  ])("rechaza lo que no es Base64: %s", (input) => {
    expect(() => decodeBase64File(input)).toThrow(FileToolError);
  });

  it("rechaza caracteres fuera del alfabeto y longitudes imposibles", () => {
    expect(() => decodeBase64File("aG9s*YQ==")).toThrow(FileToolError);
    expect(() => decodeBase64File("aG9sY")).toThrow(FileToolError);
    expect(() => decodeBase64File("   ")).toThrow(FileToolError);
    expect(() => decodeBase64File("data:text/plain;base64,")).toThrow(FileToolError);
  });
});

describe("assertMaxSize", () => {
  it("deja pasar archivos dentro del límite", () => {
    expect(() => assertMaxSize([{ name: "a.pdf", size: MAX_PDF_BYTES }], MAX_PDF_BYTES)).not.toThrow();
  });

  it("nombra el archivo que se pasa del límite", () => {
    expect(() =>
      assertMaxSize(
        [
          { name: "chico.pdf", size: 1 },
          { name: "grande.pdf", size: MAX_PDF_BYTES + 1 },
        ],
        MAX_PDF_BYTES
      )
    ).toThrow('"grande.pdf" supera el máximo de 50 MB.');
  });

  it("no repite el peso cuando redondea igual que el límite", () => {
    expect(() =>
      assertMaxSize([{ name: "a.bin", size: 10 * 1024 * 1024 + 1 }], 10 * 1024 * 1024)
    ).toThrow('"a.bin" supera el máximo de 10 MB.');
    expect(() =>
      assertMaxSize([{ name: "b.bin", size: 12 * 1024 * 1024 }], 10 * 1024 * 1024)
    ).toThrow('"b.bin" supera el máximo de 10 MB (pesa 12 MB).');
  });
});

describe("formatBytes", () => {
  it.each([
    [512, "512 B"],
    [2048, "2 KB"],
    [1.5 * 1024 * 1024, "1.5 MB"],
    [50 * 1024 * 1024, "50 MB"],
  ])("%d → %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});
