import { Metadata } from "next";
import Base64ConverterForm from "./Base64ConverterForm";

export const metadata: Metadata = {
  title: "Convertidor Base64",
  description: "Herramienta para convertir texto a codificación Base64 y viceversa de forma instantánea.",
};

export default function Page() {
  return <Base64ConverterForm />;
}