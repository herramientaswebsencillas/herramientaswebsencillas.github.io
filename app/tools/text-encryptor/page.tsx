import { Metadata } from "next";
import ToolGuide from "@/components/ToolGuide";
import ToolHeader from "@/components/ToolHeader";
import { toolMetadata } from "@/lib/tools";
import TextEncryptorForm from "./TextEncryptorForm";

export const metadata: Metadata = toolMetadata("text-encryptor");

export default function Page() {
  return (
    <TextEncryptorForm
      guide={<ToolGuide slug="text-encryptor" tone="dark" />}
      header={
        <ToolHeader slug="text-encryptor" tone="dark">
          Escribe una frase secreta y protege cualquier mensaje con AES-256. Todo ocurre en tu
          navegador, nada se guarda ni se envía.
        </ToolHeader>
      }
    />
  );
}
