import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import ProofreaderForm from "./ProofreaderForm";

export const metadata: Metadata = toolMetadata("proofreader");

export default function Page() {
  return (
    <ProofreaderForm
      guide={<ToolGuide slug="proofreader" />}
      header={
        <ToolHeader slug="proofreader">
          Escribe tu texto, revisa las observaciones y aplica las correcciones con un clic.
        </ToolHeader>
      }
    />
  );
}
