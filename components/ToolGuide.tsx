import JsonLd from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { TOOL_GUIDES } from "@/lib/toolGuides";
import { findTool } from "@/lib/tools";

/* "Cómo se usa" y preguntas frecuentes de una herramienta, debajo de ella, con
   sus datos estructurados (WebApplication y FAQPage). Como ToolHeader, lo
   renderiza page.tsx en el servidor: así el texto queda en el HTML estático,
   que es lo que leen buscadores y agentes de IA, y no en el JavaScript. */
const TONES = {
  light: {
    box: "border-slate-200",
    heading: "text-slate-800",
    question: "text-slate-800",
    text: "text-slate-600",
    marker: "bg-slate-800 text-white",
  },
  dark: {
    box: "border-slate-800",
    heading: "text-slate-100",
    question: "text-slate-200",
    text: "text-slate-400",
    marker: "bg-slate-200 text-slate-900",
  },
} as const;

export default function ToolGuide({
  slug,
  tone = "light",
}: {
  slug: string;
  tone?: keyof typeof TONES;
}) {
  const tool = findTool(slug);
  const guide = TOOL_GUIDES[slug];
  if (!guide) throw new Error(`Falta la guía de "${slug}" en lib/toolGuides.ts.`);
  const colors = TONES[tone];
  const url = `${SITE_URL}/tools/${slug}`;

  return (
    <section className={`w-full max-w-3xl mx-auto mt-16 pt-10 border-t ${colors.box}`}>
      <h2 className={`text-xl font-bold mb-4 ${colors.heading}`}>Cómo se usa</h2>
      <ol className="space-y-3 mb-10">
        {guide.steps.map((step, i) => (
          <li key={i} className={`flex gap-3 ${colors.text}`}>
            <span
              aria-hidden="true"
              className={`shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${colors.marker}`}
            >
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <h2 className={`text-xl font-bold mb-4 ${colors.heading}`}>Preguntas frecuentes</h2>
      <div className="space-y-5">
        {guide.faqs.map((faq) => (
          <div key={faq.question}>
            <h3 className={`font-semibold mb-1 ${colors.question}`}>{faq.question}</h3>
            <p className={colors.text}>{faq.answer}</p>
          </div>
        ))}
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              "@id": url,
              name: tool.name,
              description: tool.description,
              url,
              inLanguage: "es",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Cualquiera (navegador web)",
              browserRequirements: "Requiere JavaScript",
              isAccessibleForFree: true,
              offers: { "@type": "Offer", price: "0", priceCurrency: "MXN" },
              isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
            },
            {
              "@type": "FAQPage",
              mainEntity: guide.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            },
          ],
        }}
      />
    </section>
  );
}
