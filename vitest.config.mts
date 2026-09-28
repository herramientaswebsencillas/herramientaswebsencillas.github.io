import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    // Las pruebas contra los servicios reales van aparte: vitest.apis.config.mts.
    exclude: ["lib/**/*.live.test.ts"],
    // Una zona con horario de verano, para que las pruebas de fechas cubran
    // los días de 23 y 25 horas sin depender de la zona de quien las ejecute.
    env: { TZ: "America/New_York" },
    // PBKDF2 con 600 000 iteraciones tarda unos cientos de milisegundos.
    testTimeout: 20_000,
  },
});
