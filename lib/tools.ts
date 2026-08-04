/* Catálogo de herramientas que se muestra en la página de inicio.
   Para publicar una herramienta nueva basta con añadir una entrada a la
   categoría que le corresponda: el maquetado y los colores salen de aquí. */

export interface Tool {
  /** Segmento de la ruta bajo /tools/ */
  slug: string;
  name: string;
  /** La tarjeta reserva dos líneas: si el texto se pasa, esa tarjeta crecerá. */
  description: string;
}

export interface Category {
  name: string;
  /** Criterio de la categoría, para saber dónde encaja cada herramienta nueva. */
  criterion: string;
  accent: AccentName;
  tools: Tool[];
}

/* Las clases se escriben completas a propósito: Tailwind rastrea el código
   fuente en busca de literales, así que un `hover:border-${color}-300`
   construido en tiempo de ejecución no generaría ningún estilo. */

export type AccentName = keyof typeof ACCENTS;

export const ACCENTS = {
  purple: {
    rule: "bg-purple-200",
    card: "hover:border-purple-300",
    title: "group-hover:text-purple-600",
  },
  emerald: {
    rule: "bg-emerald-200",
    card: "hover:border-emerald-300",
    title: "group-hover:text-emerald-600",
  },
  amber: {
    rule: "bg-amber-200",
    card: "hover:border-amber-300",
    title: "group-hover:text-amber-600",
  },
  rose: {
    rule: "bg-rose-200",
    card: "hover:border-rose-300",
    title: "group-hover:text-rose-600",
  },
  blue: {
    rule: "bg-blue-200",
    card: "hover:border-blue-300",
    title: "group-hover:text-blue-600",
  },
  cyan: {
    rule: "bg-cyan-200",
    card: "hover:border-cyan-300",
    title: "group-hover:text-cyan-600",
  },
  indigo: {
    rule: "bg-indigo-200",
    card: "hover:border-indigo-300",
    title: "group-hover:text-indigo-600",
  },
} as const;

/* El orden importa para el maquetado: la página de inicio reparte estas
   categorías en dos columnas CSS y el navegador solo puede cortar entre una
   categoría y la siguiente. Al añadir herramientas conviene comprobar que las
   dos columnas siguen quedando parejas y, si no, mover una categoría de sitio. */
export const CATEGORIES: Category[] = [
  {
    name: "Calculadoras",
    criterion: "cálculos numéricos sobre datos que introduce el usuario",
    accent: "purple",
    tools: [
      {
        slug: "compound-interest-calculator",
        name: "Calculadora de Interés Compuesto",
        description:
          "Herramienta para calcular el crecimiento del interés a lo largo del tiempo basado en la frecuencia, capital y tasa.",
      },
      {
        slug: "loan-calculator",
        name: "Calculadora de Préstamos",
        description:
          "Calcula tu cuota, compara sistemas de amortización y visualiza tu tabla de pagos incluyendo seguros u otros gastos.",
      },
      {
        slug: "date-difference-calculator",
        name: "Calculadora de Tiempo entre Fechas",
        description:
          "Calcula cuántos días, semanas, meses y años hay entre dos fechas, y crea enlaces de cuenta regresiva para compartir.",
      },
    ],
  },
  {
    name: "Convertidores",
    criterion: "cambian un contenido de un sistema de representación a otro",
    accent: "blue",
    tools: [
      {
        slug: "text-to-speech",
        name: "Convertidor de Texto a Voz",
        description:
          "Escucha cualquier texto en voz alta con las voces de tu sistema y ajusta velocidad, tono y volumen.",
      },
      {
        slug: "speech-to-text",
        name: "Convertidor de Voz a Texto",
        description:
          "Dicta con el micrófono y convierte tu voz en texto que puedes editar, copiar o descargar.",
      },
      {
        slug: "roman-converter",
        name: "Convertidor de Números Romanos",
        description:
          "Convierte números decimales a romanos y viceversa de forma instantánea.",
      },
      {
        slug: "currency-converter",
        name: "Conversor de Divisas y Tipo de Cambio",
        description:
          "Convierte entre 165 monedas y consulta la evolución histórica del tipo de cambio.",
      },
    ],
  },
  {
    name: "Manejo de Archivos",
    criterion: "operaciones sobre archivos que sube el usuario",
    accent: "emerald",
    tools: [
      {
        slug: "pdf-page-splitter",
        name: "Divisor de Páginas de PDF",
        description:
          "Segmenta archivos PDF en documentos individuales por página de manera segura.",
      },
      {
        slug: "pdf-merger",
        name: "Unir PDF",
        description:
          "Combina múltiples archivos PDF en un solo documento de forma segura.",
      },
    ],
  },
  {
    name: "Codificación",
    criterion: "codifican y descodifican datos en otra representación",
    accent: "cyan",
    tools: [
      {
        slug: "base64-converter",
        name: "Convertidor Base64",
        description:
          "Herramienta para convertir texto a codificación Base64 y viceversa de forma instantánea.",
      },
      {
        slug: "base64-file-converter",
        name: "Convertidor de Archivos Base64",
        description:
          "Herramienta para convertir archivos a codificación Base64 y viceversa de forma instantánea.",
      },
      {
        slug: "text-to-binary",
        name: "Convertidor de Texto a Binario",
        description:
          "Convierte texto a código binario y viceversa de forma rápida.",
      },
    ],
  },
  {
    name: "Generadores",
    criterion: "crean contenido nuevo en lugar de transformar una entrada",
    accent: "amber",
    tools: [
      {
        slug: "random-string",
        name: "Generador de Cadena de Caracteres Aleatorios",
        description:
          "Crea contraseñas seguras y secuencias de caracteres aleatorias al instante. Personaliza longitud, símbolos y números.",
      },
      {
        slug: "random-numbers",
        name: "Generador de Números Aleatorios",
        description:
          "Genera números al azar de forma gratuita. Configura rangos personalizados y evita repeticiones.",
      },
    ],
  },
  {
    name: "Texto e Idioma",
    criterion: "corrección y traducción de idiomas",
    accent: "rose",
    tools: [
      {
        slug: "proofreader",
        name: "Corrector de Texto",
        description:
          "Corrige errores de ortografía y gramática en tu texto de forma rápida.",
      },
      {
        slug: "translator",
        name: "Traductor de Texto",
        description:
          "Traduce tu texto de un idioma a otro de forma rápida y sencilla.",
      },
    ],
  },
  {
    name: "Seguridad",
    criterion: "cifrado y protección de datos",
    accent: "indigo",
    tools: [
      {
        slug: "text-encryptor",
        name: "Encriptador y Desencriptador de Texto",
        description:
          "Encripta y desencripta tu texto con un algoritmo de cifrado seguro y una frase secreta que elijas.",
      },
    ],
  },
];
