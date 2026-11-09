import { findTool } from "@/lib/tools";

/* Cabecera común de las herramientas: el título sale del catálogo
   (lib/tools.ts), el mismo que usan la tarjeta de inicio y el <title>.
   `children` es el subtítulo; sin él se usa la descripción del catálogo.

   `tone="dark"` es para las herramientas de fondo oscuro, como en
   ErrorMessage. */
const TONES = {
  light: { title: "text-slate-800", subtitle: "text-slate-500" },
  dark: { title: "text-slate-100", subtitle: "text-slate-400" },
} as const;

export default function ToolHeader({
  slug,
  children,
  tone = "light",
}: {
  slug: string;
  children?: React.ReactNode;
  tone?: keyof typeof TONES;
}) {
  const tool = findTool(slug);
  const colors = TONES[tone];

  return (
    <header className="max-w-3xl mx-auto mb-10 text-center">
      <h1 className={`text-3xl md:text-4xl font-bold tracking-tight mb-3 ${colors.title}`}>
        {tool.name}
      </h1>
      <p className={`text-base md:text-lg ${colors.subtitle}`}>{children ?? tool.description}</p>
    </header>
  );
}
