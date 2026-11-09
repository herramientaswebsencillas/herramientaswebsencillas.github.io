import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import RomanConverterForm from "./RomanConverterForm";

export const metadata: Metadata = toolMetadata("roman-converter");

export default function Page() {
  return (
    <RomanConverterForm
      guide={<ToolGuide slug="roman-converter" />}
      header={
        <ToolHeader slug="roman-converter">
          Convierte números decimales a romanos y viceversa de forma instantánea.
        </ToolHeader>
      }
    />
  );
}
