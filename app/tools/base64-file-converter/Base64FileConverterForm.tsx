"use client";
import type { ReactNode } from "react";
import { useState, ChangeEvent } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { copyLabel, useCopy } from "@/lib/useCopy";
import {
  FileToolError,
  MAX_BASE64_FILE_BYTES,
  assertMaxSize,
  decodeBase64File,
  downloadBlob,
  formatBytes,
} from "@/lib/files";

/** `header` y `guide` son la cabecera (ToolHeader) y la guía de uso
    (ToolGuide), que page.tsx renderiza en el servidor para que el catálogo y
    sus textos no lleguen al JavaScript. */
export default function Base64FileConverterForm({
  header,
  guide,
}: {
  header: ReactNode;
  guide: ReactNode;
}) {
  const [base64Output, setBase64Output] = useState("");
  const [base64Input, setBase64Input] = useState("");
  const [fileName, setFileName] = useState("archivo_descargado");
  const [uploadError, setUploadError] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const { copy, statusOf } = useCopy();

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setBase64Output("");
    try {
      assertMaxSize([file], MAX_BASE64_FILE_BYTES);
    } catch (error) {
      e.target.value = "";
      setUploadError(
        error instanceof FileToolError ? error.message : "No se pudo leer el archivo."
      );
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      setBase64Output(result);
    };

    reader.onerror = () => {
      setUploadError("No se pudo leer el archivo.");
    };

    reader.readAsDataURL(file);
  };

  const downloadFileFromBase64 = () => {
    setDecodeError("");
    try {
      const { bytes, mimeType } = decodeBase64File(base64Input);
      downloadBlob(new Blob([bytes], { type: mimeType }), fileName || "archivo_recuperado");
    } catch (error) {
      setDecodeError(
        error instanceof FileToolError
          ? error.message
          : "El código Base64 no es válido o no tiene el formato correcto."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {header}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-emerald-700 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                📁 Archivo a Base64
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="file"
                onChange={handleFileUpload}
                aria-label="Archivo a convertir"
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="text-xs text-slate-500">
                Máximo {formatBytes(MAX_BASE64_FILE_BYTES)} por archivo.
              </p>
              {uploadError && <ErrorMessage>{uploadError}</ErrorMessage>}
              <div className="relative">
                <textarea
                  className="w-full h-48 p-4 bg-slate-100 border border-dashed border-slate-300 text-slate-700 rounded-xl font-mono text-xs resize-none"
                  placeholder="El resultado Base64 aparecerá aquí..."
                  value={base64Output}
                  readOnly
                />
                {base64Output && (
                  <button
                    onClick={() => copy(base64Output, "base64")}
                    className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-white transition-colors"
                  >
                    {copyLabel(statusOf("base64"))}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-blue-700 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                🔗 Base64 a Archivo
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-slate-700 font-mono text-xs"
                placeholder="Pega el código Base64 (incluyendo 'data:image/...;base64,')"
                value={base64Input}
                onChange={(e) => {
                  setBase64Input(e.target.value);
                  setDecodeError("");
                }}
              />
              {decodeError && <ErrorMessage>{decodeError}</ErrorMessage>}
              <button
                onClick={downloadFileFromBase64}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200"
              >
                Descargar Archivo Reconstruido
              </button>
              <p className="text-xs text-slate-500 italic text-center">
                Nota: incluye la cabecera &quot;data:tipo/subtipo;base64,&quot; para que el archivo
                conserve su tipo.
              </p>
            </div>
          </div>
        </div>
      </div>
      {guide}
    </main>
  );
}
