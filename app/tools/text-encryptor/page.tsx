import { Metadata } from "next";
import TextEncryptorForm from "./TextEncryptorForm";

export const metadata: Metadata = {
  title: "Encriptador y Desencriptador de Texto",
  description: "Encripta y desencripta tu texto con AES-256 y una frase secreta que elijas.",
};

export default function Page() {
  return <TextEncryptorForm />;
}