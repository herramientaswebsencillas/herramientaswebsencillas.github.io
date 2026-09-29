"use client";

import { useState } from "react";
import {
  CipherError,
  LEGACY_ALGORITHMS,
  PBKDF2_ITERATIONS,
  decryptText,
  detectFormat,
  encryptText,
  type LegacyAlgorithm,
} from "@/lib/cipher";

/* ----------------------------- Algoritmos ----------------------------- */

const CURRENT_LABEL = "AES-256-GCM";
const CURRENT_NOTE = `Clave derivada con PBKDF2-SHA256 (${PBKDF2_ITERATIONS.toLocaleString(
  "es-MX"
)} iteraciones). Detecta si el texto fue alterado.`;

const LEGACY_LABELS: Record<LegacyAlgorithm, string> = {
  AES: "AES",
  TripleDES: "Triple DES",
  Rabbit: "Rabbit",
  RC4: "RC4",
};

/* -------------------------------- Página -------------------------------- */

type Mode = "encrypt" | "decrypt";

// Qué se copió por última vez, para mostrar el check de confirmación
// en el botón correcto sin mezclar estados.
type CopiedTarget = "result" | "passphrase" | null;

export default function TextEncryptorForm() {
  const [mode, setMode] = useState<Mode>("encrypt");
  const [input, setInput] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [legacyAlgorithm, setLegacyAlgorithm] = useState<LegacyAlgorithm>("AES");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<CopiedTarget>(null);
  const [busy, setBusy] = useState(false);

  const isLegacyInput = mode === "decrypt" && detectFormat(input) === "legacy";

  async function runCipher() {
    setError("");
    setCopied(null);
    setBusy(true);
    try {
      const output =
        mode === "encrypt"
          ? await encryptText(input, passphrase)
          : await decryptText(input, passphrase, legacyAlgorithm);
      setResult(output);
    } catch (err) {
      setResult("");
      setError(err instanceof CipherError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setBusy(false);
    }
  }

  function swapMode(next: Mode) {
    setMode(next);
    setInput(result || input);
    setResult("");
    setError("");
    setCopied(null);
  }

  async function copyToClipboard(text: string, target: CopiedTarget) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(target);
      setTimeout(() => setCopied((current) => (current === target ? null : current)), 1800);
    } catch {
      // portapapeles no disponible
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-12 sm:py-20 bg-slate-950 min-h-screen">
      <div className="w-full max-w-2xl mx-auto mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-100 tracking-tight">
          Encripta un texto con tu propia frase secreta
        </h1>
        <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-lg mx-auto">
          Escribe una frase secreta y protege cualquier mensaje con AES-256. Todo ocurre en tu
          navegador, nada se guarda ni se envía.
        </p>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        {/* Toggle encriptar / desencriptar */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-lg border border-slate-800 bg-slate-900 w-fit">
          <button
            type="button"
            onClick={() => swapMode("encrypt")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === "encrypt"
                ? "bg-teal-400 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Encriptar
          </button>
          <button
            type="button"
            onClick={() => swapMode("decrypt")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === "decrypt"
                ? "bg-teal-400 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Desencriptar
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6 space-y-5">
          {/* Texto de entrada */}
          <label className="block">
            <span className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">
              {mode === "encrypt" ? "Texto a encriptar" : "Texto encriptado"}
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encrypt"
                  ? "Escribe el mensaje que quieres proteger…"
                  : "Pega aquí el texto encriptado…"
              }
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-400 resize-y"
            />
          </label>

          {/* Frase secreta + algoritmo heredado */}
          <div className={`grid gap-4 ${isLegacyInput ? "sm:grid-cols-[1fr_auto]" : ""}`}>
            <label className="block">
              <span className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">
                Frase secreta
              </span>
              <div className="relative">
                <input
                  type={showPassphrase ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Tu clave compartida"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 pr-20 text-slate-100 outline-none focus:border-teal-400"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(passphrase, "passphrase")}
                    disabled={!passphrase}
                    className="text-slate-500 hover:text-teal-400 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-500"
                  >
                    {copied === "passphrase" ? "copiada ✓" : "copiar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassphrase((v) => !v)}
                    className="text-slate-500 hover:text-teal-400 text-xs cursor-pointer"
                  >
                    {showPassphrase ? "ocultar" : "ver"}
                  </button>
                </div>
              </div>
            </label>

            {isLegacyInput && (
              <label className="block">
                <span className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">
                  Algoritmo
                </span>
                <select
                  value={legacyAlgorithm}
                  onChange={(e) => setLegacyAlgorithm(e.target.value as LegacyAlgorithm)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-400 cursor-pointer w-full sm:w-36"
                >
                  {LEGACY_ALGORITHMS.map((id) => (
                    <option key={id} value={id}>
                      {LEGACY_LABELS[id]}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {/* Indicador del formato */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5">
            {isLegacyInput ? (
              <>
                <p className="text-xs text-amber-300">Formato anterior</p>
                <p className="text-[11px] text-slate-500 max-w-[20rem] text-right">
                  Texto cifrado con la versión previa de esta herramienta. Elige el algoritmo con el
                  que se encriptó; si vuelves a encriptarlo, se usará el formato actual, más seguro.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-200 whitespace-nowrap">{CURRENT_LABEL}</p>
                <p className="text-[11px] text-slate-500 hidden sm:block max-w-[20rem] text-right">
                  {CURRENT_NOTE}
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={runCipher}
            disabled={busy}
            className="w-full rounded-lg bg-teal-400 text-slate-950 font-semibold py-3 hover:bg-teal-300 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {busy ? "Procesando…" : mode === "encrypt" ? "Encriptar texto" : "Desencriptar texto"}
          </button>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-400 border border-red-900 bg-red-950/40 rounded-lg px-3.5 py-2.5"
            >
              {error}
            </p>
          )}

          {result && (
            <div className="rounded-lg border border-teal-900 bg-slate-950">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800">
                <span className="text-[11px] text-teal-400 uppercase tracking-wider">
                  Resultado
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result, "result")}
                  className="text-[11px] text-slate-400 hover:text-teal-400 cursor-pointer"
                >
                  {copied === "result" ? "copiado ✓" : "copiar"}
                </button>
              </div>
              <p className="text-sm text-teal-200 px-3.5 py-3 break-all whitespace-pre-wrap leading-relaxed">
                {result}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-5">
          Todo el cifrado ocurre en tu navegador. Nada se envía a un servidor.
        </p>
      </div>
    </main>
  );
}
