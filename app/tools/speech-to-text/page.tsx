import { Metadata } from "next";
import SpeechToTextForm from "./SpeechToTextForm";

export const metadata: Metadata = {
  title: "Convertidor de Voz a Texto",
  description:
    "Dicta con el micrófono y convierte tu voz en texto que puedes editar, copiar o descargar, directamente desde el navegador.",
};

export default function Page() {
  return <SpeechToTextForm />;
}
