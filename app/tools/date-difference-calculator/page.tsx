import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import DateDifferenceCalculatorForm from "./DateDifferenceCalculatorForm";

export const metadata: Metadata = toolMetadata("date-difference-calculator");

export default function Page() {
  return (
    <DateDifferenceCalculatorForm
      guide={<ToolGuide slug="date-difference-calculator" />}
      header={
        <ToolHeader slug="date-difference-calculator">
          Calcula cuántos días, semanas, meses y años hay a partir de una fecha. Por defecto cuenta
          desde el primer día del año en curso hasta hoy.
        </ToolHeader>
      }
    />
  );
}
