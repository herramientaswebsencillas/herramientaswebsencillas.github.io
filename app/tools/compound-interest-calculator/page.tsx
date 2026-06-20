import { Metadata } from "next";
import CompoundInterestCalculatorForm from "./CompoundInterestCalculatorForm";

export const metadata: Metadata = {
  title: "Calculadora de Interés Compuesto",
  description: "Herramienta para calcular el crecimiento del interés compuesto a lo largo del tiempo basado en la frecuencia, el capital y la tasa.",
};

export default function Page() {
  return <CompoundInterestCalculatorForm />;
}