/* Origen del sitio que prueban las E2E. Por defecto, el export estático de
   out/ servido en local; con E2E_BASE_URL, cualquier otro (el monitoreo diario
   pasa así las pruebas de humo sobre el sitio publicado). */

export const LOCAL_PORT = 4173;

export const SITE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${LOCAL_PORT}`;

export const SITE_ORIGIN = new URL(SITE_URL).origin;

export const IS_LOCAL = !process.env.E2E_BASE_URL;
