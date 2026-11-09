import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import SpeechToTextForm from "./SpeechToTextForm";

export const metadata: Metadata = toolMetadata("speech-to-text");

export default function Page() {
  return (
    <SpeechToTextForm
      guide={<ToolGuide slug="speech-to-text" />}
      header={
        <ToolHeader slug="speech-to-text">
          Dicta con el micrófono y convierte tu voz en texto que puedes editar, copiar o descargar.
        </ToolHeader>
      }
    />
  );
}
