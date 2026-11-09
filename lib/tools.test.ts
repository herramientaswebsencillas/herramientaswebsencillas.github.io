import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TOOL_GUIDES } from "./toolGuides";
import { ACCENTS, CATEGORIES, findTool, toolMetadata } from "./tools";

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

describe("findTool y toolMetadata", () => {
  it("cada carpeta de app/tools/ está en el catálogo", () => {
    const dir = fileURLToPath(new URL("../app/tools/", import.meta.url));
    for (const slug of readdirSync(dir)) expect(() => findTool(slug)).not.toThrow();
  });

  it("toma el título y la descripción del catálogo, con su URL canónica", () => {
    const tool = findTool("pdf-merger");
    expect(toolMetadata("pdf-merger")).toMatchObject({
      title: tool.name,
      description: tool.description,
      alternates: { canonical: "/tools/pdf-merger" },
      openGraph: { url: "/tools/pdf-merger", siteName: "Herramientas Web Sencillas" },
    });
  });

  it("falla con un slug que no existe", () => {
    expect(() => findTool("no-existe")).toThrow(/no está en el catálogo/);
  });
});

describe("guías de uso", () => {
  it("cada herramienta del catálogo tiene su guía, y no sobran guías", () => {
    expect(Object.keys(TOOL_GUIDES).sort()).toEqual(tools.map((tool) => tool.slug).sort());
  });

  it.each(Object.entries(TOOL_GUIDES))("la guía de %s tiene pasos y preguntas", (_, guide) => {
    expect(guide.steps.length).toBeGreaterThanOrEqual(3);
    expect(guide.faqs.length).toBeGreaterThanOrEqual(2);
  });
});
