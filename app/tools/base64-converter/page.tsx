import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import Base64ConverterForm from "./Base64ConverterForm";

export const metadata: Metadata = toolMetadata("base64-converter");

export default function Page() {
  return (
    <Base64ConverterForm
      guide={<ToolGuide slug="base64-converter" />}
      header={
        <ToolHeader slug="base64-converter">
          Codifica y decodifica texto en formato Base64 de forma segura y rápida.
        </ToolHeader>
      }
    />
  );
}
