import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import TextToBinaryForm from "./TextToBinaryForm";

export const metadata: Metadata = toolMetadata("text-to-binary");

export default function Page() {
  return (
    <TextToBinaryForm
      guide={<ToolGuide slug="text-to-binary" tone="dark" />}
      header={
        <ToolHeader slug="text-to-binary" tone="dark">
          Convierte texto a codificación binaria y viceversa en tiempo real.
        </ToolHeader>
      }
    />
  );
}
