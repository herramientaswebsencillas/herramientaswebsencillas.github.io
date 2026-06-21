"use client";

import { useMemo, useState } from "react";
import CryptoJS from "crypto-js";

/* ----------------------------- Algoritmos ----------------------------- */

type AlgorithmId = "AES" | "TripleDES" | "Rabbit" | "RC4";

interface AlgorithmInfo {
  id: AlgorithmId;
  label: string;
  keySize: string;
  note: string;
  strength: 1 | 2 | 3 | 4; // 1 = débil, 4 = fuerte
}

const ALGORITHMS: AlgorithmInfo[] = [
  {
    id: "AES",
    label: "AES",
    keySize: "256 bits",
    note: "Estándar actual. Recomendado para uso general.",
    strength: 4,
  },
  {
    id: "TripleDES",
    label: "Triple DES",
    keySize: "168 bits",
    note: "Más lento. Conservado por compatibilidad histórica.",
    strength: 3,
  },
  {
    id: "Rabbit",
    label: "Rabbit",
    keySize: "128 bits",
    note: "Cifrado de flujo, alto rendimiento.",
    strength: 2,
  },
  {
    id: "RC4",
    label: "RC4",
    keySize: "variable",
    note: "Obsoleto. Solo con fines educativos.",
    strength: 1,
  },
];

function getAlgorithm(id: AlgorithmId): AlgorithmInfo {
  const found = ALGORITHMS.find((a) => a.id === id);
  if (!found) throw new Error(`Algoritmo desconocido: ${id}`);
  return found;
}

const engines: Record<
  AlgorithmId,
  {
    encrypt: (text: string, pass: string) => string;
    decrypt: (cipher: string, pass: string) => string;
  }
> = {
  AES: {
    encrypt: (text, pass) => CryptoJS.AES.encrypt(text, pass).toString(),
    decrypt: (cipher, pass) =>
      CryptoJS.AES.decrypt(cipher, pass).toString(CryptoJS.enc.Utf8),
  },
  TripleDES: {
    encrypt: (text, pass) => CryptoJS.TripleDES.encrypt(text, pass).toString(),
    decrypt: (cipher, pass) =>
      CryptoJS.TripleDES.decrypt(cipher, pass).toString(CryptoJS.enc.Utf8),
  },
  Rabbit: {
    encrypt: (text, pass) => CryptoJS.Rabbit.encrypt(text, pass).toString(),
    decrypt: (cipher, pass) =>
      CryptoJS.Rabbit.decrypt(cipher, pass).toString(CryptoJS.enc.Utf8),
  },
  RC4: {
    encrypt: (text, pass) => CryptoJS.RC4.encrypt(text, pass).toString(),
    decrypt: (cipher, pass) =>
      CryptoJS.RC4.decrypt(cipher, pass).toString(CryptoJS.enc.Utf8),
  },
};

class CipherError extends Error {}

function encryptText(text: string, pass: string, algorithm: AlgorithmId) {
  if (!text) throw new CipherError("Ingresa un texto para encriptar.");
  if (!pass) throw new CipherError("Ingresa una frase secreta.");
  try {
    return engines[algorithm].encrypt(text, pass);
  } catch {
    throw new CipherError("No se pudo encriptar el texto. Intenta nuevamente.");
  }
}

function decryptText(cipherText: string, pass: string, algorithm: AlgorithmId) {
  if (!cipherText) throw new CipherError("Ingresa un texto para desencriptar.");
  if (!pass) throw new CipherError("Ingresa una frase secreta.");
  let result: string;
  try {
    result = engines[algorithm].decrypt(cipherText, pass);
  } catch {
    throw new CipherError("El texto encriptado no es válido para este algoritmo.");
  }
  if (!result) {
    throw new CipherError(
      "No se pudo desencriptar. Verifica la frase secreta y el algoritmo."
    );
  }
  return result;
}

/* -------------------------------- Página -------------------------------- */

type Mode = "encrypt" | "decrypt";

// Qué se copió por última vez, para mostrar el check de confirmación
// en el botón correcto sin mezclar estados.
type CopiedTarget = "result" | "passphrase" | "algorithm" | null;

export default function TextEncryptorForm() {
  const [mode, setMode] = useState<Mode>("encrypt");
  const [input, setInput] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [algorithm, setAlgorithm] = useState<AlgorithmId>("AES");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<CopiedTarget>(null);

  const algoInfo = useMemo(() => getAlgorithm(algorithm), [algorithm]);

  function runCipher() {
    setError("");
    setCopied(null);
    try {
      const output =
        mode === "encrypt"
          ? encryptText(input, passphrase, algorithm)
          : decryptText(input, passphrase, algorithm);
      setResult(output);
    } catch (err) {
      setResult("");
      setError(
        err instanceof CipherError ? err.message : "Ocurrió un error inesperado."
      );
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
          Elige un algoritmo, escribe una frase secreta y protege cualquier
          mensaje. Todo ocurre en tu navegador, nada se guarda ni se envía.
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

          {/* Frase secreta + algoritmo */}
          <div className="grid sm:grid-cols-[1fr_auto] gap-4">
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

            <label className="block">
              <span className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">
                Algoritmo
              </span>
              <div className="flex gap-2">
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value as AlgorithmId)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-400 cursor-pointer sm:w-36"
                >
                  {ALGORITHMS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(`${algoInfo.label} · ${algoInfo.keySize}`, "algorithm")
                  }
                  title="Copiar algoritmo y tamaño de clave"
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-500 hover:text-teal-400 hover:border-teal-400 text-xs cursor-pointer transition-colors"
                >
                  {copied === "algorithm" ? "✓" : "copiar"}
                </button>
              </div>
            </label>
          </div>

          {/* Indicador del algoritmo seleccionado */}
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5">
            <p className="text-xs text-slate-200">
              {algoInfo.label}{" "}
              <span className="text-slate-500">· {algoInfo.keySize}</span>
            </p>
            <p className="text-[11px] text-slate-500 hidden sm:block max-w-[16rem] text-right">
              {algoInfo.note}
            </p>
          </div>

          <button
            type="button"
            onClick={runCipher}
            className="w-full rounded-lg bg-teal-400 text-slate-950 font-semibold py-3 hover:bg-teal-300 transition-colors cursor-pointer"
          >
            {mode === "encrypt" ? "Encriptar texto" : "Desencriptar texto"}
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
