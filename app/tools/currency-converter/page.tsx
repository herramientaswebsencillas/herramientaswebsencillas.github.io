import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import CurrencyConverterForm from "./CurrencyConverterForm";

export const metadata: Metadata = toolMetadata("currency-converter");

export default function Page() {
  return (
    <CurrencyConverterForm
      guide={<ToolGuide slug="currency-converter" />}
      header={
        <ToolHeader slug="currency-converter">
          Convierte entre 165 monedas y consulta cómo ha evolucionado el tipo de cambio.
        </ToolHeader>
      }
    />
  );
}
