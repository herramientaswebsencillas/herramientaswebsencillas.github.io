import { Metadata } from "next";
import TranslatorForm from "./TranslatorForm";

export const metadata: Metadata = {
  title: "Traductor de Texto",
  description: "Traduce tu texto de un idioma a otro de forma rápida y sencilla.",
};

export default function Page() {
  return <TranslatorForm />;
}