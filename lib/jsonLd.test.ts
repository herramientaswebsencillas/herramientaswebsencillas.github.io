import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./jsonLd";

describe("serializeJsonLd", () => {
  it("escapa < para que el texto no pueda cerrar la etiqueta <script>", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
  });

  it("sigue siendo JSON válido con los mismos datos", () => {
    const data = { "@type": "HowTo", name: "a < b", steps: ["<uno>", "dos"] };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
