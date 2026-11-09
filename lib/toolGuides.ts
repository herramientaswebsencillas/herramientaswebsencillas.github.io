/* Guía de uso y preguntas frecuentes de cada herramienta. Se muestran debajo
   de la herramienta (components/ToolGuide.tsx) y se publican también como
   datos estructurados (FAQPage).

   Sirven a quien llega por primera vez y a quien no ejecuta JavaScript:
   buscadores y agentes de IA leen el HTML del export estático, y sin este
   texto varias herramientas no pasaban de un título y unos campos vacíos.

   Solo lo importan componentes de servidor (page.tsx): si lo importara un
   formulario "use client", todo este texto acabaría en el JavaScript.

   Cada afirmación debe coincidir con lo que hace la herramienta: al cambiar un
   límite o un comportamiento, se actualiza aquí en el mismo cambio. */

export interface ToolGuide {
  /** Pasos para usar la herramienta, en orden. */
  steps: string[];
  faqs: { question: string; answer: string }[];
}

/** Respuesta a "¿sale de mi equipo / se guarda?" en las herramientas locales. */
const LOCAL =
  "No. Todo se procesa en tu navegador: lo que escribes o subes no se envía a ningún servidor ni se guarda.";

export const TOOL_GUIDES: Record<string, ToolGuide> = {
  "compound-interest-calculator": {
    steps: [
      "Escribe la inversión inicial y, si vas a aportar cada mes, la aportación mensual.",
      "Indica la tasa anual, el plazo en meses y cada cuánto se capitalizan los rendimientos: diario, semanal, mensual o anual.",
      "Revisa el saldo final y la tabla mes a mes con el saldo acumulado y el rendimiento.",
    ],
    faqs: [
      {
        question: "¿Qué es el interés compuesto?",
        answer:
          "Es el interés que se calcula sobre el capital y también sobre los intereses que ya generó, de modo que el crecimiento se acelera con el tiempo.",
      },
      {
        question: "¿El resultado incluye impuestos o comisiones?",
        answer:
          "No. Es una estimación con una tasa fija durante todo el plazo; el rendimiento real depende del producto, de los impuestos y de las comisiones de cada institución.",
      },
      {
        question: "¿Cuál es el plazo máximo?",
        answer: "600 meses, es decir, 50 años.",
      },
    ],
  },
  "loan-calculator": {
    steps: [
      "Escribe el monto del préstamo, la tasa anual y el plazo en meses.",
      "Elige el sistema de pago: francés (cuota fija), alemán (cuota decreciente) o americano (solo intereses y el capital al final).",
      "Si aplica, agrega gastos extra mensuales y el porcentaje de impuesto sobre los intereses, y revisa la tabla de amortización.",
    ],
    faqs: [
      {
        question: "¿Qué diferencia hay entre los sistemas francés, alemán y americano?",
        answer:
          "En el francés pagas la misma cuota todos los meses. En el alemán abonas la misma parte de capital cada mes, así que la cuota baja con el tiempo. En el americano solo pagas intereses y devuelves todo el capital en el último pago.",
      },
      {
        question: "¿Para qué sirve el campo de impuestos?",
        answer:
          "Para préstamos en los que se cobra un impuesto sobre los intereses, como el IVA en algunos créditos en México. Se aplica a la parte de interés de cada cuota.",
      },
      {
        question: "¿La cuota coincide con la del banco?",
        answer:
          "Es una referencia. El banco puede sumar comisiones, seguros obligatorios o redondeos que la calculadora no conoce; revisa siempre la tabla de amortización oficial.",
      },
    ],
  },
  "date-difference-calculator": {
    steps: [
      "Escribe la fecha de inicio y la de fin en formato dd/mm/aaaa.",
      "Consulta el resultado en días, semanas, meses y años.",
      "Comparte la dirección de la página: guarda las fechas, así que quien la abra verá el mismo cálculo.",
    ],
    faqs: [
      {
        question: "¿Cómo creo una cuenta regresiva para compartir?",
        answer:
          'Pulsa "Crear cuenta regresiva", elige "Hacia una fecha" y copia el enlace. Como el otro extremo es siempre hoy, quien lo abra verá lo que falta en el momento en que lo visita.',
      },
      {
        question: "¿Cuenta los años bisiestos y el horario de verano?",
        answer:
          "Sí. Cuenta días de calendario, incluidos los 29 de febrero, y el cambio de horario no altera el resultado.",
      },
    ],
  },
  "text-to-speech": {
    steps: [
      "Escribe o pega el texto que quieres escuchar.",
      "Elige una voz y ajusta la velocidad, el tono y el volumen.",
      "Pulsa reproducir; puedes pausar y continuar cuando quieras.",
    ],
    faqs: [
      {
        question: "¿Por qué cambian las voces de un equipo a otro?",
        answer:
          "Las voces las aporta tu sistema operativo y tu navegador. Si falta la de tu idioma, la herramienta explica cómo instalar más voces en tu sistema.",
      },
      {
        question: "¿Mi texto sale de mi equipo?",
        answer:
          "Solo si eliges una voz en línea, que la herramienta marca como tal; esas voces procesan el texto en los servidores del navegador. Las voces locales funcionan sin conexión.",
      },
    ],
  },
  "speech-to-text": {
    steps: [
      "Elige el idioma en el que vas a hablar.",
      "Pulsa el botón para empezar a dictar y concede el permiso del micrófono.",
      "Revisa y edita el texto, y cópialo o descárgalo como archivo .txt.",
    ],
    faqs: [
      {
        question: "¿Qué navegadores lo admiten?",
        answer: "Chrome, Edge y Safari. Firefox todavía no implementa el reconocimiento de voz.",
      },
      {
        question: "¿Dónde se procesa mi voz?",
        answer:
          "En Chrome y Edge, el audio se reconoce en los servidores del navegador, no en este sitio. Este sitio no guarda ni el audio ni el texto.",
      },
    ],
  },
  "roman-converter": {
    steps: [
      "Para pasar a romanos, escribe un número entero entre 1 y 3999.",
      "Para pasar a decimal, escribe un número romano con los símbolos I, V, X, L, C, D y M.",
      "El resultado aparece al instante y puedes copiarlo.",
    ],
    faqs: [
      {
        question: "¿Por qué el máximo es 3999?",
        answer:
          "El sistema romano clásico no tiene un símbolo para 5000 ni admite repetir M más de tres veces, así que 3999 (MMMCMXCIX) es el mayor número que se puede escribir.",
      },
      {
        question: "¿Acepta números romanos mal escritos, como IIII o VX?",
        answer:
          "No. Solo acepta la forma estándar, para que la conversión sea única; si el número no es válido, la herramienta lo indica.",
      },
    ],
  },
  "currency-converter": {
    steps: [
      "Escribe la cantidad y elige la moneda de origen y la de destino.",
      "Consulta la conversión con el tipo de cambio más reciente y la fecha de esa tasa.",
      "Elige un periodo, de un mes a cinco años, para ver en la gráfica cómo ha cambiado el tipo de cambio.",
    ],
    faqs: [
      {
        question: "¿De dónde salen los tipos de cambio?",
        answer:
          "De Frankfurter, una API pública que reúne tasas de referencia de bancos centrales. El histórico usa los datos del Banco Central Europeo, por eso solo está disponible para las monedas que publica.",
      },
      {
        question: "¿Es el tipo de cambio que me dará mi banco?",
        answer:
          "No. Son tasas de referencia; bancos y casas de cambio aplican su propio margen para comprar y vender.",
      },
    ],
  },
  "pdf-page-splitter": {
    steps: [
      "Selecciona o arrastra un archivo PDF de hasta 50 MB.",
      "Pulsa el botón para dividirlo.",
      "Descarga un archivo ZIP con cada página como un PDF independiente.",
    ],
    faqs: [
      { question: "¿Mis archivos se suben a algún servidor?", answer: LOCAL },
      {
        question: "¿Funciona con PDF protegidos con contraseña?",
        answer:
          "No. Si el PDF está cifrado, primero hay que quitarle la protección con la contraseña en un lector de PDF.",
      },
    ],
  },
  "pdf-merger": {
    steps: [
      "Selecciona los PDF que quieres unir, en el orden en que deben aparecer.",
      "Comprueba la lista: hasta 50 MB por archivo y 150 MB en total.",
      "Pulsa combinar y descarga el documento resultante.",
    ],
    faqs: [
      { question: "¿Mis archivos se suben a algún servidor?", answer: LOCAL },
      {
        question: "¿Por qué hay un límite de tamaño?",
        answer:
          "Todo se procesa en la memoria de tu navegador. Por encima de esos tamaños la pestaña puede congelarse o cerrarse, así que la herramienta lo avisa antes de intentarlo.",
      },
    ],
  },
  "base64-converter": {
    steps: [
      "Para codificar, escribe o pega el texto en el panel de texto a Base64.",
      "Para decodificar, pega el código Base64 en el otro panel.",
      "Copia el resultado con el botón correspondiente.",
    ],
    faqs: [
      {
        question: "¿Base64 sirve para proteger información?",
        answer:
          "No. Base64 es una codificación, no un cifrado: cualquiera puede revertirla. Para proteger un texto usa el encriptador de este sitio.",
      },
      {
        question: "¿Admite acentos y emojis?",
        answer:
          "Sí. El texto se codifica en UTF-8, así que se conservan acentos, eñes y emojis al decodificarlo.",
      },
    ],
  },
  "base64-file-converter": {
    steps: [
      "Para codificar, selecciona un archivo de hasta 10 MB.",
      "Copia el código Base64, que incluye la cabecera data: con el tipo del archivo.",
      "Para el camino inverso, pega un código Base64 y descarga el archivo reconstruido.",
    ],
    faqs: [
      {
        question: "¿Para qué sirve convertir un archivo a Base64?",
        answer:
          "Para incrustarlo como texto donde no se admiten archivos binarios, por ejemplo una imagen dentro de un HTML, un CSS o un JSON.",
      },
      { question: "¿Mis archivos se suben a algún servidor?", answer: LOCAL },
    ],
  },
  "text-to-binary": {
    steps: [
      "Escribe texto en el primer panel para ver su representación en binario.",
      "O pega código binario en grupos de 8 bits para recuperar el texto.",
      "Copia el resultado o limpia ambos paneles para empezar de nuevo.",
    ],
    faqs: [
      {
        question: "¿Por qué algunas letras ocupan más de 8 bits?",
        answer:
          "El texto se codifica en UTF-8: las letras sin acento ocupan un byte, pero los acentos, la ñ o los emojis ocupan de dos a cuatro.",
      },
      {
        question: "¿En qué formato debo pegar el binario?",
        answer:
          "En grupos de 8 ceros y unos, separados por espacios. Si los bytes no forman texto UTF-8 válido, la herramienta lo indica.",
      },
    ],
  },
  "random-string": {
    steps: [
      "Elige la longitud, de 1 a 64 caracteres.",
      "Marca qué tipos de caracteres incluir: mayúsculas, minúsculas, números y símbolos.",
      "Genera la cadena y cópiala.",
    ],
    faqs: [
      {
        question: "¿Sirve para crear contraseñas seguras?",
        answer:
          "Sí. Usa el generador criptográfico del navegador (crypto.getRandomValues), no Math.random. Para una contraseña, conviene usar al menos 16 caracteres y los cuatro tipos.",
      },
      { question: "¿Se guarda la cadena que genero?", answer: LOCAL },
    ],
  },
  "random-numbers": {
    steps: [
      "Indica el mínimo y el máximo del rango.",
      "Elige cuántos números quieres, de 1 a 50, y si se pueden repetir.",
      "Pulsa generar para obtener los números.",
    ],
    faqs: [
      {
        question: "¿Los números son realmente aleatorios?",
        answer:
          "Usan el generador criptográfico del navegador (crypto.getRandomValues), sin el sesgo que tienen los métodos basados en Math.random. Sirven para sorteos y rifas.",
      },
      {
        question: "¿Qué pasa si pido más números sin repetir de los que caben en el rango?",
        answer:
          "Obtienes todos los números del rango, una vez cada uno. Para más resultados, amplía el rango o permite repetidos.",
      },
    ],
  },
  proofreader: {
    steps: [
      "Elige el idioma del texto o deja que se detecte solo.",
      "Escribe o pega el texto, de hasta 2000 caracteres, y pulsa revisar.",
      "Haz clic en cada palabra resaltada para ver la sugerencia y aplicarla o descartarla.",
    ],
    faqs: [
      {
        question: "¿Qué servicio revisa el texto?",
        answer:
          "LanguageTool, mediante su API pública. El texto se envía a su servidor para revisarlo; no escribas datos personales ni confidenciales.",
      },
      {
        question: "¿Por qué a veces aparece un límite de revisiones?",
        answer:
          "El plan gratuito de LanguageTool admite unas 20 revisiones por minuto desde cada conexión. Espera un minuto e inténtalo de nuevo.",
      },
    ],
  },
  translator: {
    steps: [
      "Elige el idioma original y el de destino.",
      "Escribe un párrafo de hasta 450 bytes; el contador te indica cuánto llevas.",
      "Pulsa traducir y copia el resultado.",
    ],
    faqs: [
      {
        question: "¿Qué servicio hace la traducción?",
        answer:
          "MyMemory, mediante su API pública. Conserva los textos que recibe, así que no traduzcas datos personales ni confidenciales.",
      },
      {
        question: "¿Por qué solo un párrafo y hasta 450 bytes?",
        answer:
          "MyMemory admite unos 500 bytes por petición y sus condiciones no permiten enviar varios párrafos a la vez; el sitio deja un margen. Además, el plan gratuito permite unos 5000 caracteres al día por conexión.",
      },
    ],
  },
  "text-encryptor": {
    steps: [
      "Escribe el mensaje y una frase secreta que solo conozcan tú y el destinatario.",
      "Pulsa encriptar y comparte el texto resultante, que empieza por v2:.",
      "Para leerlo, cambia a desencriptar, pega el texto y escribe la misma frase secreta.",
    ],
    faqs: [
      {
        question: "¿Qué tan seguro es?",
        answer:
          "Usa AES-256-GCM con una clave derivada de tu frase mediante PBKDF2-SHA256 de 600 000 iteraciones. La seguridad depende sobre todo de la frase: usa varias palabras o al menos 12 caracteres.",
      },
      {
        question: "¿Puedo recuperar un texto si olvido la frase?",
        answer:
          "No. La frase no se guarda en ningún sitio y sin ella el texto no se puede descifrar.",
      },
      { question: "¿Mi mensaje sale de mi equipo?", answer: LOCAL },
    ],
  },
};
