import { readFile } from "node:fs/promises";
import { expect, test, type Download } from "@playwright/test";
import JSZip from "jszip";
import { PDFDocument } from "@cantoo/pdf-lib";
import { watchPage } from "./watch";

/* Flujos de las herramientas que procesan archivos y de las que consultan
   servicios externos. Las respuestas de LanguageTool, MyMemory y Frankfurter
   se simulan con el mismo formato que validan lib/external.test.ts y el
   monitoreo diario, así que estas pruebas no dependen de la red. */

async function pdfWithPages(count: number): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < count; i++) pdf.addPage([200, 200]);
  return Buffer.from(await pdf.save());
}

async function downloaded(download: Download): Promise<Buffer> {
  return readFile(await download.path());
}

/* --------------------------------- Archivos -------------------------------- */

test.describe("conversor Base64 de archivos", () => {
  const PATH = "/tools/base64-file-converter";

  test("convierte un archivo a Base64 y lo reconstruye", async ({ page }) => {
    const check = await watchPage(page, PATH);
    await page.goto(PATH);

    await page.getByLabel("Archivo a convertir").setInputFiles({
      name: "hola.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hola mundo"),
    });
    const output = page.getByPlaceholder("El resultado Base64 aparecerá aquí...");
    await expect(output).toHaveValue("data:text/plain;base64,aG9sYSBtdW5kbw==");

    await page.getByPlaceholder(/Pega el código Base64/).fill(await output.inputValue());
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Descargar Archivo Reconstruido" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("hola.txt");
    expect((await downloaded(download)).toString()).toBe("hola mundo");
    await check();
  });

  test("rechaza una URL javascript: sin ejecutarla", async ({ page }) => {
    const check = await watchPage(page, PATH);
    await page.goto(PATH);

    let downloads = 0;
    page.on("download", () => downloads++);
    await page.getByPlaceholder(/Pega el código Base64/).fill("javascript:window.__pwned=1");
    await page.getByRole("button", { name: "Descargar Archivo Reconstruido" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: "Solo se aceptan datos Base64" })
    ).toBeVisible();
    expect(await page.evaluate(() => "__pwned" in window)).toBe(false);
    expect(downloads).toBe(0);
    await check();
  });

  test("descarga un HTML pegado sin abrirlo ni ejecutarlo", async ({ page }) => {
    const check = await watchPage(page, PATH);
    await page.goto(PATH);

    const html = "<script>parent.__pwned=1;window.__pwned=1</script><h1>x</h1>";
    await page
      .getByPlaceholder(/Pega el código Base64/)
      .fill(`data:text/html;base64,${Buffer.from(html).toString("base64")}`);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Descargar Archivo Reconstruido" }).click(),
    ]);

    expect((await downloaded(download)).toString()).toBe(html);
    await expect(page).toHaveURL(new RegExp(`${PATH}$`));
    expect(await page.evaluate(() => "__pwned" in window)).toBe(false);
    await check();
  });

  test("rechaza archivos demasiado grandes", async ({ page }) => {
    const check = await watchPage(page, PATH);
    await page.goto(PATH);

    await page.getByLabel("Archivo a convertir").setInputFiles({
      name: "grande.bin",
      mimeType: "application/octet-stream",
      buffer: Buffer.alloc(11 * 1024 * 1024),
    });
    await expect(page.getByRole("alert").filter({ hasText: "grande.bin" })).toBeVisible();
    await expect(page.getByPlaceholder("El resultado Base64 aparecerá aquí...")).toHaveValue("");
    await check();
  });
});

test("une varios PDF en uno", async ({ page }) => {
  const check = await watchPage(page, "/tools/pdf-merger");
  await page.goto("/tools/pdf-merger");

  await page.locator("#pdf-upload").setInputFiles([
    { name: "uno.pdf", mimeType: "application/pdf", buffer: await pdfWithPages(1) },
    { name: "dos.pdf", mimeType: "application/pdf", buffer: await pdfWithPages(2) },
  ]);
  await expect(page.getByText("Archivos seleccionados (2)")).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Combinar y Descargar" }).click(),
  ]);
  const merged = await PDFDocument.load(await downloaded(download));
  expect(merged.getPageCount()).toBe(3);
  await check();
});

test("divide un PDF en páginas dentro de un ZIP", async ({ page }) => {
  const check = await watchPage(page, "/tools/pdf-page-splitter");
  await page.goto("/tools/pdf-page-splitter");

  await page.locator('input[type="file"]').setInputFiles({
    name: "informe.pdf",
    mimeType: "application/pdf",
    buffer: await pdfWithPages(3),
  });
  await expect(page.getByText("3 páginas detectadas")).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Descargar Páginas Individuales/ }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("informe-individual-pages.zip");
  const zip = await JSZip.loadAsync(await downloaded(download));
  expect(Object.keys(zip.files).sort()).toEqual([
    "informe-page-1.pdf",
    "informe-page-2.pdf",
    "informe-page-3.pdf",
  ]);
  await check();
});

/* ---------------------------- Servicios externos --------------------------- */

test("el corrector muestra y aplica las sugerencias de LanguageTool", async ({ page }) => {
  const check = await watchPage(page);
  let sentText = "";
  await page.route("https://api.languagetool.org/v2/check", async (route) => {
    sentText = new URLSearchParams(route.request().postData() ?? "").get("text") ?? "";
    await route.fulfill({
      json: {
        matches: [
          {
            message: "Posible error ortográfico.",
            offset: 0,
            length: 4,
            replacements: [{ value: "Había" }],
            rule: {
              id: "MORFOLOGIK_RULE_ES",
              category: { id: "TYPOS", name: "Errores ortográficos" },
            },
          },
        ],
      },
    });
  });
  await page.goto("/tools/proofreader");

  await page.getByPlaceholder(/Escribe o pega aquí el texto/).fill("Avia una vez.");
  await page.getByRole("button", { name: "Revisar texto" }).click();
  await expect(page.getByText("1 observación encontrada")).toBeVisible();
  expect(sentText).toBe("Avia una vez.");

  await page.getByText("Avia", { exact: true }).click();
  await page.getByRole("button", { name: "Había" }).click();
  await expect(page.getByText("Había una vez.")).toBeVisible();
  await check();
});

test.describe("traductor", () => {
  test("muestra la traducción de MyMemory", async ({ page }) => {
    const check = await watchPage(page);
    await page.route("https://api.mymemory.translated.net/get?*", (route) =>
      route.fulfill({
        json: {
          responseData: { translatedText: "hello world", match: 1 },
          quotaFinished: false,
          responseStatus: 200,
        },
      })
    );
    await page.goto("/tools/translator");

    await page.getByPlaceholder(/Escribe o pega el texto/).fill("hola mundo");
    await page.getByRole("button", { name: "Traducir", exact: true }).click();
    await expect(page.getByPlaceholder("La traducción aparecerá aquí...")).toHaveValue(
      "hello world"
    );
    await check();
  });

  test("avisa cuando se agota la cuota en lugar de mostrarla como traducción", async ({ page }) => {
    const check = await watchPage(page);
    await page.route("https://api.mymemory.translated.net/get?*", (route) =>
      route.fulfill({
        json: {
          responseData: {
            translatedText: "MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY.",
          },
          responseStatus: 200,
        },
      })
    );
    await page.goto("/tools/translator");

    await page.getByPlaceholder(/Escribe o pega el texto/).fill("hola mundo");
    await page.getByRole("button", { name: "Traducir", exact: true }).click();
    await expect(page.getByText(/Se agotó por hoy la cuota gratuita/)).toBeVisible();
    await expect(page.getByPlaceholder("La traducción aparecerá aquí...")).toHaveValue("");
    await check();
  });
});

test.describe("conversor de divisas", () => {
  test("convierte con las tasas de Frankfurter", async ({ page }) => {
    const check = await watchPage(page);
    await page.route("https://api.frankfurter.dev/v2/rates?*", (route) => {
      const url = new URL(route.request().url());
      // Sin "from" es la consulta de las tasas actuales; con "from", la serie.
      const body = url.searchParams.has("from")
        ? [
            { date: "2026-09-01", base: "USD", quote: "MXN", rate: 18.1 },
            { date: "2026-09-25", base: "USD", quote: "MXN", rate: 18.5 },
          ]
        : [
            { date: "2026-09-25", base: "USD", quote: "MXN", rate: 18.5 },
            { date: "2026-09-25", base: "USD", quote: "EUR", rate: 0.9 },
          ];
      return route.fulfill({ json: body });
    });
    await page.goto("/tools/currency-converter");

    await expect(page.getByText(/1 USD = 18\.5000 MXN/)).toBeVisible();
    await expect(page.getByText("Tasa del 25/09/2026")).toBeVisible();
    await check();
  });

  test("muestra un error si el servicio falla", async ({ page }) => {
    const check = await watchPage(page);
    await page.route("https://api.frankfurter.dev/v2/rates?*", (route) =>
      route.fulfill({ status: 503, body: "Service Unavailable" })
    );
    await page.goto("/tools/currency-converter");

    await expect(page.getByText("No se pudieron obtener las tasas de cambio")).toBeVisible();
    await check();
  });
});
