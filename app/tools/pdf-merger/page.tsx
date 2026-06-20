import { Metadata } from "next";
import PdfMergerForm from "./PdfMergerForm";

export const metadata: Metadata = {
  title: "Unir PDF",
  description: "Combina múltiples archivos PDF en un solo documento de forma segura.",
};

export default function Page() {
  return <PdfMergerForm />;
}