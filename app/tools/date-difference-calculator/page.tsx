import { Metadata } from "next";
import DateDifferenceCalculatorForm from "./DateDifferenceCalculatorForm";

export const metadata: Metadata = {
  title: "Calculadora de Tiempo entre Fechas",
  description:
    "Calcula cuántos días, semanas, meses y años hay a partir de una fecha, contando desde el primer día del año en curso hasta hoy.",
};

export default function Page() {
  return <DateDifferenceCalculatorForm />;
}
