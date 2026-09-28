import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ACCENTS, CATEGORIES } from "./tools";

const tools = CATEGORIES.flatMap((category) => category.tools);

describe("catálogo de herramientas", () => {
  it("no repite slugs", () => {
    const slugs = tools.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(tools.map((tool) => tool.slug))("la herramienta %s tiene su página", (slug) => {
    const page = fileURLToPath(new URL(`../app/tools/${slug}/page.tsx`, import.meta.url));
    expect(existsSync(page)).toBe(true);
  });

  it("cada categoría usa un acento definido", () => {
    for (const category of CATEGORIES) {
      expect(ACCENTS).toHaveProperty(category.accent);
    }
  });
});
