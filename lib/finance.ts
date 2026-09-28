/* Cálculos de la calculadora de préstamos y de la de interés compuesto.
   Viven aparte de los componentes para poder probarlos sin montar React. */

/* ------------------------------- Préstamos ------------------------------- */

export type AmortizationSystem = "frances" | "aleman" | "americano";

export interface LoanInput {
  loanAmount: number;
  annualRate: number;
  months: number;
  monthlyInsurance: number;
  taxRate: number; // Porcentaje de impuesto sobre el interés (ej. IVA)
  system: AmortizationSystem;
}

export interface LoanRow {
  month: number;
  totalPayment: number;
  basePayment: number;
  insurance: number;
  principal: number;
  interest: number;
  tax: number;
  balance: number;
}

export interface LoanTotals {
  firstPayment: number;
  totalInterest: number;
  totalInsurance: number;
  totalTax: number;
  totalPaid: number;
}

export interface LoanResult {
  table: LoanRow[];
  totals: LoanTotals;
}

const EMPTY_LOAN: LoanResult = {
  table: [],
  totals: { firstPayment: 0, totalInterest: 0, totalInsurance: 0, totalTax: 0, totalPaid: 0 },
};

export function calculateLoan({
  loanAmount,
  annualRate,
  months: n,
  monthlyInsurance,
  taxRate,
  system,
}: LoanInput): LoanResult {
  if (!(loanAmount > 0) || !(n > 0)) return EMPTY_LOAN;

  const r = annualRate > 0 ? annualRate / 100 / 12 : 0;

  let currentBalance = loanAmount;
  let totalInterest = 0;
  let totalTax = 0;
  const table: LoanRow[] = [];

  for (let i = 1; i <= n; i++) {
    let interestPayment = currentBalance * r;
    let principalPayment = 0;
    let baseMonthlyPayment = 0;

    if (system === "frances") {
      // Cuota base constante
      const p = r > 0 ? (loanAmount * r) / (1 - Math.pow(1 + r, -n)) : loanAmount / n;
      principalPayment = p - interestPayment;
      baseMonthlyPayment = p;
    } else if (system === "aleman") {
      // Abono a capital constante
      principalPayment = loanAmount / n;
      baseMonthlyPayment = principalPayment + interestPayment;
    } else {
      // Americano: solo intereses, capital al final
      interestPayment = loanAmount * r;
      principalPayment = i === n ? loanAmount : 0;
      baseMonthlyPayment = principalPayment + interestPayment;
    }

    const taxPayment = interestPayment * (taxRate / 100);

    currentBalance -= principalPayment;
    // Evitar números negativos ínfimos por redondeo de JavaScript
    if (currentBalance < 0.01) currentBalance = 0;

    totalInterest += interestPayment;
    totalTax += taxPayment;

    table.push({
      month: i,
      totalPayment: baseMonthlyPayment + monthlyInsurance + taxPayment,
      basePayment: baseMonthlyPayment,
      insurance: monthlyInsurance,
      principal: principalPayment,
      interest: interestPayment,
      tax: taxPayment,
      balance: currentBalance,
    });
  }

  const totalInsurance = monthlyInsurance * n;

  return {
    table,
    totals: {
      firstPayment: table[0].totalPayment,
      totalInterest,
      totalInsurance,
      totalTax,
      totalPaid: loanAmount + totalInterest + totalInsurance + totalTax,
    },
  };
}

/* --------------------------- Interés compuesto --------------------------- */

export interface CompoundInput {
  initialAmount: number;
  monthlyContribution: number;
  months: number;
  rate: number; // Tasa anual en porcentaje
  frequency: number; // Capitalizaciones por año
}

export interface CompoundRow {
  month: number;
  interest: number;
  contribution: number;
  balance: number;
}

export interface CompoundResult {
  table: CompoundRow[];
  totals: { final: number; invested: number; interest: number };
}

export function calculateCompoundInterest({
  initialAmount,
  monthlyContribution,
  months,
  rate,
  frequency,
}: CompoundInput): CompoundResult {
  let currentBalance = initialAmount;
  let totalInvested = initialAmount;

  // Tasa mensual equivalente a capitalizar `frequency` veces al año.
  const effectiveMonthlyRate = Math.pow(1 + rate / 100 / frequency, frequency / 12) - 1;

  const table: CompoundRow[] = [];

  for (let i = 1; i <= months; i++) {
    const interestEarned = currentBalance * effectiveMonthlyRate;
    currentBalance += interestEarned + monthlyContribution;
    totalInvested += monthlyContribution;

    table.push({
      month: i,
      interest: interestEarned,
      contribution: monthlyContribution,
      balance: currentBalance,
    });
  }

  return {
    table,
    totals: {
      final: currentBalance,
      invested: totalInvested,
      interest: currentBalance - totalInvested,
    },
  };
}
