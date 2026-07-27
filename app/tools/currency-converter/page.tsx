import { Metadata } from "next";
import CurrencyConverterForm from "./CurrencyConverterForm";

export const metadata: Metadata = {
  title: "Conversor de Divisas y Tipo de Cambio",
  description:
    "Convierte entre 165 monedas con tasas de referencia de bancos centrales y consulta la evolución histórica del tipo de cambio.",
};

export default function Page() {
  return <CurrencyConverterForm />;
}
