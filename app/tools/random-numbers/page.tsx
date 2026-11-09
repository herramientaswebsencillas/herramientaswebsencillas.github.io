import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import RandomNumbersForm from "./RandomNumbersForm";

export const metadata: Metadata = toolMetadata("random-numbers");

export default function Page() {
  return (
    <RandomNumbersForm
      guide={<ToolGuide slug="random-numbers" />}
      header={<ToolHeader slug="random-numbers" />}
    />
  );
}
