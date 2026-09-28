import { defineConfig } from "vitest/config";

// Solo el monitoreo de servicios externos (consultas reales por la red).
export default defineConfig({
  test: {
    include: ["lib/**/*.live.test.ts"],
    testTimeout: 30_000,
    // Un tropiezo de red aislado no debe disparar la alerta.
    retry: 2,
  },
});
