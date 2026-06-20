import { Metadata } from "next";
import PdfPageSplitterForm from "./PdfPageSplitterForm";

export const metadata: Metadata = {
  title: "Divisor de Páginas de PDF",
  description: "Segmenta archivos PDF en documentos individuales por página de manera segura.",
};

export default function Page() {
  return <PdfPageSplitterForm />;
}