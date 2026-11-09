import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import PdfMergerForm from "./PdfMergerForm";

export const metadata: Metadata = toolMetadata("pdf-merger");

export default function Page() {
  return (
    <PdfMergerForm
      guide={<ToolGuide slug="pdf-merger" />}
      header={
        <ToolHeader slug="pdf-merger">
          Combina múltiples archivos PDF en un solo documento manteniendo el orden seleccionado.
        </ToolHeader>
      }
    />
  );
}
