import { Metadata } from "next";
import Base64FileConverterForm from "./Base64FileConverterForm";

export const metadata: Metadata = {
  title: "Convertidor de Archivos Base64",
  description: "Herramienta para convertir archivos a codificación Base64 y viceversa de forma instantánea.",
};

export default function Page() {
  return <Base64FileConverterForm />;
}