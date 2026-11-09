import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import TextToSpeechForm from "./TextToSpeechForm";

export const metadata: Metadata = toolMetadata("text-to-speech");

export default function Page() {
  return (
    <TextToSpeechForm
      guide={<ToolGuide slug="text-to-speech" />}
      header={
        <ToolHeader slug="text-to-speech">
          Escucha cualquier texto en voz alta con las voces de tu sistema o de tu navegador.
        </ToolHeader>
      }
    />
  );
}
