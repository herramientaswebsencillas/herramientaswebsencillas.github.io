import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import RandomStringForm from "./RandomStringForm";

export const metadata: Metadata = toolMetadata("random-string");

export default function Page() {
  return (
    <RandomStringForm
      guide={<ToolGuide slug="random-string" />}
      header={<ToolHeader slug="random-string" />}
    />
  );
}
