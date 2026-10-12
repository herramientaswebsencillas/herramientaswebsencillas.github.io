/* Textos cifrados fijos, compartidos por lib/cipher.test.ts y las pruebas E2E.

   FIXED_V2 se generó una sola vez fuera de encryptText con la Web Crypto API
   (PBKDF2-SHA256, 600 000 iteraciones, sal de 16 bytes, IV de 12 y
   AES-256-GCM, en ese orden). Es el contrato "v2:" del README: los textos que
   la gente ya compartió tienen esta forma. Si una prueba deja de descifrarlo,
   el cambio rompe esos textos y necesita un prefijo nuevo (ver
   "Compatibilidad"). No se debe regenerar para que la prueba pase. */

export const FIXED_MESSAGE = "¡Hola, ñandú! Texto con acentos y emoji 🔐\nen dos líneas.";
export const FIXED_PASSPHRASE = "una frase secreta larga";
export const FIXED_V2 =
  "v2:U2nfr2jyX5wck9NuWfJVyQYGO09R2Mo3MJwrw6eJeInBBSmY6m2Vc/7UAC7MX/V71G0Kf5oZhqRvMd+DshxGCxvyTIvh9m6OAsHy9pBJBoW++JIbzTwJtjtu7TF7T+7AK571LA6r+BsphsA=";

/** AES de CryptoJS, el formato de la versión anterior, que ya no se admite. */
export const LEGACY_CRYPTOJS = "U2FsdGVkX1/jvMXwI1DfupzC/g1wkOdIYM7eWjKPn4g=";
