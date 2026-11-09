import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import Base64FileConverterForm from "./Base64FileConverterForm";

export const metadata: Metadata = toolMetadata("base64-file-converter");

export default function Page() {
  return (
    <Base64FileConverterForm
      guide={<ToolGuide slug="base64-file-converter" />}
      header={
        <ToolHeader slug="base64-file-converter">
          Convierte imágenes, PDFs o cualquier archivo a Base64 y viceversa.
        </ToolHeader>
      }
    />
  );
}
