import { Metadata } from "next";
import ProofreaderForm from "./ProofreaderForm";

export const metadata: Metadata = {
  title: "Corrector de Texto",
  description: "Corrige errores de ortografía y gramática en tu texto de forma rápida.",
};

export default function Page() {
  return <ProofreaderForm />;
}