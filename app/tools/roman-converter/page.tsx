import { Metadata } from "next";
import RomanConverterForm from "./RomanConverterForm";

export const metadata: Metadata = {
  title: "Convertidor de Números Romanos",
  description: "Convierte números decimales a números romanos y viceversa de forma rápida y sencilla.",
};

export default function Page() {
  return <RomanConverterForm />;
}