import { Metadata } from "next";
import TextEncryptorForm from "./TextEncryptorForm";

export const metadata: Metadata = {
  title: "Encriptador y Desencriptador de Texto",
  description: "Encripta y desencripta tu texto con un algoritmo de cifrado seguro y una frase secreta que elijas.",
};

export default function Page() {
  return <TextEncryptorForm />;
}