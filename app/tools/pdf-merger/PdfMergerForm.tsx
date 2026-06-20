"use client";

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function PdfMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const mergePDFs = async () => {
    if (files.length < 2) return alert("Selecciona al menos 2 archivos");

    setMerging(true);
    try {
      // 1. Crear un nuevo documento PDF
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        // 2. Leer el archivo como ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        // 3. Copiar todas las páginas del PDF actual
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        // 4. Añadirlas al documento final
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // 5. Guardar el resultado y generar la descarga
      const mergedPdfBytes = await mergedPdf.save();

      // Creamos un Blob a partir de una copia explícita de los bytes
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'archivo_combinado.pdf';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al fusionar:", error);
      alert("Hubo un error al procesar los archivos.");
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#f8fafc]">
      
      {/* Contenedor principal para alinear cabecera y cuadro */}
      <div className="w-full max-w-xl flex flex-col items-center">
        
        {/* Cabecera extraída del cuadro blanco */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6 shadow-sm border border-red-200">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-3">Unir PDF</h1>
          <p className="text-slate-500 text-sm md:text-base px-4">
            Combina múltiples archivos PDF en un solo documento manteniendo el orden seleccionado.
          </p>
        </div>

        {/* Cuadro Blanco (Solo la funcionalidad) */}
        <div className="w-full bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 md:p-10 transition-all">
          <div className="space-y-6">
            
            {/* Zona de Carga */}
            <div className="relative">
              <label 
                htmlFor="pdf-upload" 
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-slate-600"><span className="font-semibold text-blue-600">Haz clic para subir</span> o arrastra tus archivos</p>
                  <p className="text-xs text-slate-400">PDF (Múltiples permitidos)</p>
                </div>
                <input 
                  id="pdf-upload"
                  type="file" 
                  multiple 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="hidden" 
                />
              </label>
            </div>

            {/* Lista de Archivos Seleccionados */}
            {files.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-700">Archivos seleccionados ({files.length})</h3>
                  <button 
                    onClick={() => setFiles([])} 
                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                  >
                    Limpiar todo
                  </button>
                </div>
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                        {i + 1}
                      </span>
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-600 font-medium truncate w-full" title={f.name}>
                        {f.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botón Principal */}
            <button
              onClick={mergePDFs}
              disabled={merging || files.length < 2}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all duration-200 shadow-md ${
                merging || files.length < 2 
                  ? 'bg-slate-300 shadow-none cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20 active:scale-[0.98]'
              }`}
            >
              {merging ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando Documentos...
                </>
              ) : (
                'Combinar y Descargar'
              )}
            </button>

            {/* Aviso de Privacidad */}
            <div className="mt-8 flex items-start sm:items-center justify-center gap-3 text-slate-500 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.946-2.56 9.12-6.433 11.49a1 1 0 01-1.134 0C6.56 16.12 4 11.946 4 7.001c0-.68.056-1.35.166-2.001zm9.497 10.301A11.002 11.002 0 0016.001 7c0-.622-.046-1.233-.133-1.833a10.954 10.954 0 01-5.868-2.617 10.954 10.954 0 01-5.868 2.617c-.087.6-.133 1.211-.133 1.833 0 4.408 2.297 8.147 5.736 10.301a1 1 0 001.066 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Privacidad Total: Tus archivos nunca salen de tu dispositivo.</span>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}