import { defineConfig, devices } from "@playwright/test";
import { IS_LOCAL, LOCAL_PORT, SITE_URL } from "./e2e/site";

// Pruebas sobre el export estático (out/), que es lo que se publica.
// Requieren `pnpm build` antes: el servidor solo sirve lo que ya está en out/.
// Con E2E_BASE_URL se prueban contra ese sitio y no se levanta el servidor
// local (ver el job "published" de .github/workflows/external-apis.yml).
export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: SITE_URL,
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: IS_LOCAL
    ? {
        command: "node scripts/serve-out.mjs",
        env: { PORT: String(LOCAL_PORT) },
        url: SITE_URL,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
