/* Mensaje de error en línea de las herramientas. Sustituye a alert(), que
   bloquea la página, no se puede estilizar y se pierde al cerrarlo; con
   role="alert" los lectores de pantalla lo anuncian igual al aparecer.

   `tone="dark"` es para las herramientas de fondo oscuro. Va como prop y no
   como otra clase de color en `className`: dos utilidades text-red-* en el
   mismo elemento no garantizan cuál gana. */
const TONES = {
  light: "text-red-600",
  dark: "text-red-400",
} as const;

export default function ErrorMessage({
  children,
  className = "",
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <p role="alert" className={["text-sm", TONES[tone], className].join(" ").trim()}>
      {children}
    </p>
  );
}
