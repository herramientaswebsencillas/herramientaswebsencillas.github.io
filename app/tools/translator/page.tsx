import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import TranslatorForm from "./TranslatorForm";

export const metadata: Metadata = toolMetadata("translator");

export default function Page() {
  return (
    <TranslatorForm
      guide={<ToolGuide slug="translator" />}
      header={
        <ToolHeader slug="translator">
          Traduce texto entre múltiples idiomas usando una API gratuita.
        </ToolHeader>
      }
    />
  );
}
