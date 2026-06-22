"use client";

import { useState, useRef, useCallback, JSX } from "react";

// LanguageTool: API pública, sin key, ideal para uso personal/demo.
// Límite ~20 req/min y ~20,000 caracteres por request en el servidor gratuito.
const LANGUAGETOOL_ENDPOINT = "https://api.languagetool.org/v2/check";

// Límite real de la API: 20,000 caracteres. Usamos el 10% como margen de seguridad.
const API_CHAR_LIMIT = 20000;
const MAX_CHARS = Math.floor(API_CHAR_LIMIT * 0.10);

type Status = "idle" | "checking" | "done" | "error";

interface LTReplacement {
  value: string;
}

interface LTCategory {
  id: string;
  name?: string;
}

interface LTRule {
  id?: string;
  category?: LTCategory;
}

interface LTMatch {
  message: string;
  offset: number;
  length: number;
  replacements: LTReplacement[];
  rule?: LTRule;
}

interface LTResponse {
  matches: LTMatch[];
}

interface LanguageOption {
  code: string;
  label: string;
}

// Códigos aceptados por la API de LanguageTool. "auto" deja que el servicio
// detecte el idioma del texto automáticamente.
const LANGUAGES: LanguageOption[] = [
  { code: "auto", label: "Detectar automáticamente" },
  { code: "es", label: "Español" },
  { code: "en-US", label: "Inglés (EE. UU.)" },
  { code: "en-GB", label: "Inglés (Reino Unido)" },
  { code: "pt-BR", label: "Portugués (Brasil)" },
  { code: "pt-PT", label: "Portugués (Portugal)" },
  { code: "fr", label: "Francés" },
  { code: "de", label: "Alemán" },
  { code: "it", label: "Italiano" },
  { code: "ca", label: "Catalán" },
];

const CATEGORY_LABELS: Record<string, string> = {
  TYPOS: "Ortografía",
  GRAMMAR: "Gramática",
  PUNCTUATION: "Puntuación",
  STYLE: "Estilo",
  TYPOGRAPHY: "Tipografía",
  CASING: "Mayúsculas",
  REDUNDANCY: "Redundancia",
  default: "Redacción",
};

function categoryLabel(match: LTMatch): string {
  const id = match.rule?.category?.id;
  return (id && CATEGORY_LABELS[id]) || CATEGORY_LABELS.default;
}

// Ortografía = rojo, todo lo demás (gramática, estilo, puntuación...) = ámbar
function isSpelling(match: LTMatch): boolean {
  return categoryLabel(match) === "Ortografía";
}

export default function ProofreaderForm() {
  const [text, setText] = useState<string>(
    "Avia una ves un lugar donde las palabras se escribian sin cuidado, y nadie se daba cuenta de los herrores asta que era demaciado tarde."
  );
  const [matches, setMatches] = useState<LTMatch[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("es");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const checkText = useCallback(async () => {
    if (!text.trim()) return;
    setStatus("checking");
    setActiveId(null);
    try {
      const params = new URLSearchParams({
        text,
        language,
      });
      const res = await fetch(LANGUAGETOOL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: LTResponse = await res.json();
      setMatches(data.matches || []);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [text, language]);

  const applyFix = (match: LTMatch, replacement: string) => {
    const before = text.slice(0, match.offset);
    const after = text.slice(match.offset + match.length);
    const newText = before + replacement + after;
    setText(newText);

    // Recorremos las coincidencias restantes y ajustamos sus offsets
    const delta = replacement.length - match.length;
    setMatches((prev) =>
      prev
        .filter((m) => m !== match)
        .map((m) =>
          m.offset > match.offset ? { ...m, offset: m.offset + delta } : m
        )
    );
    setActiveId(null);
  };

  const dismissMatch = (match: LTMatch) => {
    setMatches((prev) => prev.filter((m) => m !== match));
    setActiveId(null);
  };

  // Construye los segmentos de texto resaltado
  const renderHighlighted = () => {
    if (matches.length === 0) {
      return <span>{text}</span>;
    }

    const sorted = [...matches].sort((a, b) => a.offset - b.offset);
    const segments: JSX.Element[] = [];
    let cursor = 0;

    sorted.forEach((m, i) => {
      if (m.offset > cursor) {
        segments.push(
          <span key={`plain-${i}`}>{text.slice(cursor, m.offset)}</span>
        );
      }
      const errorText = text.slice(m.offset, m.offset + m.length);
      const id = `${m.offset}-${m.length}-${i}`;
      const isActive = activeId === id;
      const spelling = isSpelling(m);

      segments.push(
        <span key={id} className="relative inline">
          <mark
            onClick={() => setActiveId(isActive ? null : id)}
            tabIndex={0}
            role="button"
            aria-expanded={isActive}
            className={`cursor-pointer rounded px-0.5 bg-transparent underline decoration-wavy decoration-2 underline-offset-2 transition-colors ${
              spelling
                ? "decoration-red-500"
                : "decoration-amber-500"
            } ${isActive ? (spelling ? "bg-red-50" : "bg-amber-50") : ""}`}
          >
            {errorText}
          </mark>

          {isActive && (
            <span
              onClick={(e) => e.stopPropagation()}
              className="absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xl"
            >
              {/* Flechita apuntando a la palabra */}
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white" />

              <span
                className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  spelling
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    spelling ? "bg-red-500" : "bg-amber-500"
                  }`}
                />
                {categoryLabel(m)}
              </span>

              <p className="mb-3 text-sm leading-snug text-slate-700">
                {m.message}
              </p>

              {m.replacements?.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Sugerencias
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.replacements.slice(0, 3).map((r, ri) => (
                      <button
                        key={ri}
                        onClick={() => applyFix(m, r.value)}
                        className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
                      >
                        {r.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => dismissMatch(m)}
                className="text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
              >
                Ignorar esta observación
              </button>
            </span>
          )}
        </span>
      );
      cursor = m.offset + m.length;
    });

    if (cursor < text.length) {
      segments.push(<span key="plain-end">{text.slice(cursor)}</span>);
    }

    return segments;
  };

  const errorCount = matches.length;
  const charCount = text.length;
  const isNearLimit = charCount >= MAX_CHARS * 0.9;
  const isAtLimit = charCount >= MAX_CHARS;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-slate-800">
          Corrector de texto
        </h2>
        <p className="mb-8 text-center text-sm font-medium text-slate-400">
          Escribe tu texto, revisa las observaciones y aplica las correcciones
          con un clic.
        </p>

        <div className="mb-4 flex items-center justify-between gap-3">
          <label
            htmlFor="language-select"
            className="text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            Idioma del texto
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={status === "checking"}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 transition-colors focus-within:border-blue-200">
          {status === "idle" || status === "error" ? (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              maxLength={MAX_CHARS}
              placeholder="Escribe o pega aquí el texto que quieres revisar…"
              rows={4}
              className="w-full resize-y bg-transparent text-base leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
            />
          ) : (
            <div className="text-base leading-relaxed text-slate-800 whitespace-pre-wrap">
              {renderHighlighted()}
            </div>
          )}
        </div>

        {(status === "idle" || status === "error") && (
          <p
            className={`mt-2 text-right text-xs font-medium ${
              isAtLimit
                ? "text-red-500"
                : isNearLimit
                ? "text-amber-500"
                : "text-slate-400"
            }`}
          >
            {charCount.toLocaleString("es")} / {MAX_CHARS.toLocaleString("es")}{" "}
            caracteres
          </p>
        )}

        {status === "error" && (
          <p className="mt-3 text-center text-sm font-medium text-red-600">
            ⚠️ No se pudo conectar con el servicio de corrección. Intenta de
            nuevo en un momento.
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-500">
            {status === "checking" && (
              <span className="animate-pulse">Revisando…</span>
            )}
            {status === "done" &&
              (errorCount === 0 ? (
                <span className="text-green-600">
                  ✓ Sin observaciones — buena prueba
                </span>
              ) : (
                <span>
                  {errorCount} observación{errorCount === 1 ? "" : "es"}{" "}
                  encontrada{errorCount === 1 ? "" : "s"}
                </span>
              ))}
          </span>

          <div className="flex gap-2">
            {status === "done" && (
              <button
                onClick={() => {
                  setStatus("idle");
                  setMatches([]);
                }}
                className="rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100"
              >
                Editar texto
              </button>
            )}
            <button
              onClick={checkText}
              disabled={status === "checking" || !text.trim()}
              className="rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {status === "checking" ? "Revisando…" : "Revisar texto"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Corrección de texto impulsada por{" "}
          <a
            href="https://languagetool.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-500 underline-offset-2 hover:text-blue-600 hover:underline"
          >
            LanguageTool
          </a>
          . El texto que ingreses para corregir se comparte con este servicio.
        </p>
      </div>
    </div>
  );
}