import { Metadata } from "next";
import TextToBinaryForm from "./TextToBinaryForm";

export const metadata: Metadata = {
  title: "Traductor de Texto a Binario",
  description: "Convierte texto a código binario y viceversa de forma rápida.",
};

export default function Page() {
  return <TextToBinaryForm />;
}