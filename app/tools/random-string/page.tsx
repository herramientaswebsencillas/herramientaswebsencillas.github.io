import { Metadata } from "next";
import RandomStringForm from "./RandomStringForm";

export const metadata: Metadata = {
  title: "Generador de Cadena de Caracteres Aleatorios",
  description: "Crea contraseñas seguras y secuencias de caracteres aleatorias al instante. Personaliza longitud, símbolos y números.",
};

export default function Page() {
  return <RandomStringForm />;
}