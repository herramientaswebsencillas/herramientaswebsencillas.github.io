import { describe, expect, it } from "vitest";
import { calculateCompoundInterest, calculateLoan, type LoanInput } from "./finance";

const base: LoanInput = {
  loanAmount: 100_000,
  annualRate: 12,
  months: 12,
  monthlyInsurance: 0,
  taxRate: 0,
  system: "frances",
};

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

describe("calculateLoan", () => {
  it("sistema francés: cuota constante que liquida el capital", () => {
    const { table, totals } = calculateLoan(base);
    expect(table).toHaveLength(12);
    // 100 000 · 0.01 / (1 − 1.01^−12)
    for (const row of table) expect(row.basePayment).toBeCloseTo(8884.88, 2);
    expect(sum(table.map((r) => r.principal))).toBeCloseTo(100_000, 6);
    expect(table.at(-1)!.balance).toBe(0);
    expect(totals.totalInterest).toBeCloseTo(6618.55, 2);
  });

  it("sistema francés sin interés: reparte el capital en partes iguales", () => {
    const { table, totals } = calculateLoan({ ...base, annualRate: 0 });
    for (const row of table) expect(row.basePayment).toBeCloseTo(100_000 / 12, 6);
    expect(totals.totalInterest).toBe(0);
  });

  it("sistema alemán: abono a capital constante e interés decreciente", () => {
    const { table } = calculateLoan({ ...base, system: "aleman" });
    for (const row of table) expect(row.principal).toBeCloseTo(100_000 / 12, 6);
    expect(table[0].interest).toBeCloseTo(1000, 6);
    expect(table[11].interest).toBeLessThan(table[0].interest);
    expect(table.at(-1)!.balance).toBe(0);
  });

  it("sistema americano: solo intereses y el capital al final", () => {
    const { table } = calculateLoan({ ...base, system: "americano" });
    for (const row of table) expect(row.interest).toBeCloseTo(1000, 6);
    expect(table.slice(0, -1).every((r) => r.principal === 0)).toBe(true);
    expect(table.at(-1)!.principal).toBe(100_000);
    expect(table.at(-1)!.balance).toBe(0);
  });

  it("suma el impuesto sobre el interés y el seguro a cada cuota", () => {
    const { table, totals } = calculateLoan({ ...base, taxRate: 16, monthlyInsurance: 250 });
    const first = table[0];
    expect(first.tax).toBeCloseTo(first.interest * 0.16, 6);
    expect(first.totalPayment).toBeCloseTo(first.basePayment + 250 + first.tax, 6);
    expect(totals.firstPayment).toBe(first.totalPayment);
    expect(totals.totalInsurance).toBe(3000);
    expect(totals.totalPaid).toBeCloseTo(
      100_000 + totals.totalInterest + totals.totalInsurance + totals.totalTax,
      6
    );
  });

  it("devuelve un resultado vacío con monto o plazo no válidos", () => {
    for (const input of [
      { ...base, loanAmount: 0 },
      { ...base, months: 0 },
      { ...base, loanAmount: Number.NaN },
    ]) {
      const { table, totals } = calculateLoan(input);
      expect(table).toEqual([]);
      expect(totals.totalPaid).toBe(0);
    }
  });
});

describe("calculateCompoundInterest", () => {
  const input = { initialAmount: 10_000, monthlyContribution: 0, months: 12, rate: 12, frequency: 12 };

  it("capitalización mensual", () => {
    const { totals } = calculateCompoundInterest(input);
    expect(totals.final).toBeCloseTo(10_000 * 1.01 ** 12, 6); // 11 268.25
    expect(totals.interest).toBeCloseTo(1268.25, 2);
  });

  it("capitalización anual equivale a la tasa nominal en 12 meses", () => {
    const { totals } = calculateCompoundInterest({ ...input, frequency: 1 });
    expect(totals.final).toBeCloseTo(11_200, 6);
  });

  it("sin interés solo acumula las aportaciones", () => {
    const { table, totals } = calculateCompoundInterest({
      ...input,
      rate: 0,
      monthlyContribution: 1000,
    });
    expect(table).toHaveLength(12);
    expect(totals).toEqual({ final: 22_000, invested: 22_000, interest: 0 });
  });
});
