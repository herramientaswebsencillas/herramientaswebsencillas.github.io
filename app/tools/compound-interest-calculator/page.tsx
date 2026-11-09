import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import CompoundInterestCalculatorForm from "./CompoundInterestCalculatorForm";

export const metadata: Metadata = toolMetadata("compound-interest-calculator");

export default function Page() {
  return (
    <CompoundInterestCalculatorForm
      guide={<ToolGuide slug="compound-interest-calculator" />}
      header={<ToolHeader slug="compound-interest-calculator" />}
    />
  );
}
