import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

// Pruebas de humo sobre el export estático (out/), que es lo que se publica.
// Requieren `pnpm build` antes: el servidor solo sirve lo que ya está en out/.
export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/serve-out.mjs",
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
