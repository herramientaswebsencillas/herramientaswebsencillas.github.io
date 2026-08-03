import { Metadata } from "next";
import TextToSpeechForm from "./TextToSpeechForm";

export const metadata: Metadata = {
  title: "Convertidor de Texto a Voz",
  description:
    "Escucha cualquier texto en voz alta con las voces de tu sistema y ajusta velocidad, tono y volumen, directamente desde el navegador.",
};

export default function Page() {
  return <TextToSpeechForm />;
}
