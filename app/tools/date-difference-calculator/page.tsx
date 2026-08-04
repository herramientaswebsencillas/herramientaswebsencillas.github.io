import { Metadata } from "next";
import DateDifferenceCalculatorForm from "./DateDifferenceCalculatorForm";

export const metadata: Metadata = {
  title: "Calculadora de Tiempo entre Fechas",
  description:
    "Calcula cuántos días, semanas, meses y años hay entre dos fechas, y crea enlaces de cuenta regresiva que se recalculan cada vez que se abren.",
};

export default function Page() {
  return <DateDifferenceCalculatorForm />;
}
