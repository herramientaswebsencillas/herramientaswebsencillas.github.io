import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import LoanCalculatorForm from "./LoanCalculatorForm";

export const metadata: Metadata = toolMetadata("loan-calculator");

export default function Page() {
  return (
    <LoanCalculatorForm
      guide={<ToolGuide slug="loan-calculator" />}
      header={
        <ToolHeader slug="loan-calculator">
          Calcula tu cuota, compara sistemas de amortización y visualiza tu tabla de pagos
          incluyendo seguros, impuestos y otros gastos.
        </ToolHeader>
      }
    />
  );
}
