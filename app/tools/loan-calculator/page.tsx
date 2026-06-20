import { Metadata } from "next";
import LoanCalculatorForm from "./LoanCalculatorForm";

export const metadata: Metadata = {
  title: "Calculadora de Préstamos",
  description: "Calcula tu cuota, compara sistemas de amortización y visualiza tu tabla de pagos incluyendo seguros u otros gastos.",
};

export default function Page() {
  return <LoanCalculatorForm />;
}