import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import PdfPageSplitterForm from "./PdfPageSplitterForm";

export const metadata: Metadata = toolMetadata("pdf-page-splitter");

export default function Page() {
  return (
    <PdfPageSplitterForm
      guide={<ToolGuide slug="pdf-page-splitter" />}
      header={
        <ToolHeader slug="pdf-page-splitter">
          Separa cada página de tu PDF en archivos individuales dentro de un ZIP.
        </ToolHeader>
      }
    />
  );
}
