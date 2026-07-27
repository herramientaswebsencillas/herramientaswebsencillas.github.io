import { Metadata } from "next";
import SpeechConverterForm from "./SpeechConverterForm";

export const metadata: Metadata = {
  title: "Convertidor de Texto a Voz y Voz a Texto",
  description:
    "Escucha cualquier texto en voz alta o dicta con el micrófono para convertir tu voz en texto, directamente desde el navegador.",
};

export default function Page() {
  return <SpeechConverterForm />;
}
