import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PARAM_END,
  PARAM_START,
  addMonths,
  calculateDifference,
  datesFromSearch,
  defaultDates,
  directionOf,
  formatWhileTyping,
  parseDate,
  toDateValue,
} from "./dates";

const d = (day: number, month: number, year: number) => new Date(year, month - 1, day);

describe("parseDate / toDateValue", () => {
  it("lee fechas dd/mm/aaaa y las vuelve a escribir igual", () => {
    expect(toDateValue(parseDate("05/03/2024")!)).toBe("05/03/2024");
    expect(parseDate("29/02/2024")).toEqual(d(29, 2, 2024));
  });

  it("rechaza fechas que no existen", () => {
    expect(parseDate("31/02/2024")).toBeNull();
    expect(parseDate("29/02/2023")).toBeNull();
    expect(parseDate("00/01/2024")).toBeNull();
    expect(parseDate("15/13/2024")).toBeNull();
  });

  it("rechaza otros formatos", () => {
    expect(parseDate("1/2/2024")).toBeNull();
    expect(parseDate("2024-02-01")).toBeNull();
    expect(parseDate("01/02/24")).toBeNull();
    expect(parseDate("")).toBeNull();
  });
});

describe("formatWhileTyping", () => {
  it("inserta las barras a partir de los dígitos", () => {
    expect(formatWhileTyping("25")).toBe("25");
    expect(formatWhileTyping("2512")).toBe("25/12");
    expect(formatWhileTyping("25122026")).toBe("25/12/2026");
  });

  it("ignora lo que no son dígitos y recorta a ocho", () => {
    expect(formatWhileTyping("25-12.2026")).toBe("25/12/2026");
    expect(formatWhileTyping("2512202699")).toBe("25/12/2026");
    expect(formatWhileTyping("ab")).toBe("");
  });
});

describe("addMonths", () => {
  it("recorta al último día del mes destino", () => {
    expect(addMonths(d(31, 1, 2024), 1)).toEqual(d(29, 2, 2024));
    expect(addMonths(d(31, 1, 2023), 1)).toEqual(d(28, 2, 2023));
    expect(addMonths(d(31, 12, 2024), 2)).toEqual(d(28, 2, 2025));
  });
});

describe("calculateDifference", () => {
  it("mide un año bisiesto completo", () => {
    const diff = calculateDifference(d(1, 1, 2024), d(1, 1, 2025));
    expect(diff).toMatchObject({
      days: 366,
      weeks: 52,
      daysAfterWeeks: 2,
      months: 12,
      daysAfterMonths: 0,
      years: 1,
      monthsAfterYears: 0,
    });
  });

  it("no depende del orden de las fechas", () => {
    const a = calculateDifference(d(15, 3, 2020), d(2, 8, 2026));
    const b = calculateDifference(d(2, 8, 2026), d(15, 3, 2020));
    expect(a).toEqual(b);
  });

  it("cuenta días de calendario al cruzar el horario de verano", () => {
    // El 10/03/2024 duró 23 h en America/New_York (ver vitest.config.mts).
    expect(calculateDifference(d(1, 3, 2024), d(31, 3, 2024)).days).toBe(30);
    // El 03/11/2024 duró 25 h.
    expect(calculateDifference(d(1, 11, 2024), d(30, 11, 2024)).days).toBe(29);
  });

  it("cuenta como mes completo del 31/01 al último día de febrero", () => {
    expect(calculateDifference(d(31, 1, 2023), d(28, 2, 2023))).toMatchObject({
      months: 1,
      daysAfterMonths: 0,
    });
  });

  it("devuelve cero para el mismo día", () => {
    expect(calculateDifference(d(5, 5, 2025), d(5, 5, 2025))).toMatchObject({
      days: 0,
      months: 0,
    });
  });
});

describe("con la fecha de hoy fijada", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 27, 15, 30)); // 27/09/2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("directionOf distingue pasado, futuro y rangos que cruzan hoy", () => {
    expect(directionOf(d(1, 1, 2026), d(27, 9, 2026))).toBe("past");
    expect(directionOf(d(27, 9, 2026), d(25, 12, 2026))).toBe("future");
    expect(directionOf(d(1, 9, 2026), d(1, 10, 2026))).toBe("crossing");
  });

  it("defaultDates va del 1 de enero a hoy", () => {
    expect(defaultDates()).toEqual({ start: "01/01/2026", end: "27/09/2026" });
  });

  // Contrato público de los enlaces compartidos: ver "Parámetros de URL" en el README.
  describe("datesFromSearch", () => {
    it("usa los nombres de parámetro documentados", () => {
      expect(PARAM_START).toBe("desde");
      expect(PARAM_END).toBe("hasta");
    });

    it("completa con hoy el extremo ausente", () => {
      expect(datesFromSearch("?hasta=25/12/2026")).toEqual({
        start: "27/09/2026",
        end: "25/12/2026",
      });
      expect(datesFromSearch("?desde=15/03/2024")).toEqual({
        start: "15/03/2024",
        end: "27/09/2026",
      });
    });

    it("respeta ambos extremos", () => {
      expect(datesFromSearch("?desde=01/02/2020&hasta=03/04/2021")).toEqual({
        start: "01/02/2020",
        end: "03/04/2021",
      });
    });

    it("ignora fechas inexistentes y cae en el rango por defecto", () => {
      expect(datesFromSearch("?desde=31/02/2024")).toEqual(defaultDates());
      expect(datesFromSearch("?hasta=2026-12-25")).toEqual(defaultDates());
    });

    it("sin parámetros muestra el año en curso", () => {
      expect(datesFromSearch("")).toEqual(defaultDates());
    });
  });
});
