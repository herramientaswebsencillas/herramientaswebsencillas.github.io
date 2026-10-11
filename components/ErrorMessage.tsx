/* Mensaje de error en línea de las herramientas. Sustituye a alert(), que
   bloquea la página, no se puede estilizar y se pierde al cerrarlo; con
   role="alert" los lectores de pantalla lo anuncian igual al aparecer. */
export default function ErrorMessage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p role="alert" className={["text-sm text-red-600", className].join(" ").trim()}>
      {children}
    </p>
  );
}
