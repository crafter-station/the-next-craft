import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/*
  Cómo entra un mentor o un jurado.

  No pasa por Better Auth. El resto del sitio entra por OTP al correo, y para
  el panel eso fallaba justo donde más duele: el código solo se envía a correos
  dados de alta, así que quien escribía otra dirección no recibía nada —ni un
  error—. En una sala con ruido y la ronda corriendo, eso es un mentor parado
  esperando un correo que nunca va a llegar.

  Aquí la credencial es un código que el staff dicta. Quien lo tiene es ese
  panelista: no hay segundo factor y no pretendemos que lo haya. Es una entrada
  a un evento de un día, no una cuenta.

  La sesión es una cookie firmada con HMAC sobre `BETTER_AUTH_SECRET`. Se firma
  y no se guarda en base a propósito: no hace falta una tabla de sesiones para
  algo que dura lo que dura el evento, y una cookie firmada no se puede
  falsificar sin el secreto.
*/

/** Sin O/0 ni I/1/L: el código se dicta en voz alta en una sala llena. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

export const PANELIST_COOKIE = "tnc_panel";
const SESSION_DAYS = 7;

/**
 * Un código nuevo.
 *
 * Ocho caracteres sobre 31 símbolos son ~8·10¹¹ combinaciones. No es para
 * resistir a un atacante con tiempo infinito —para eso está el límite de
 * intentos—, es para que nadie acierte uno por casualidad probando a mano.
 *
 * `randomBytes` y no `Math.random`: el sesgo del módulo sobre 256 con un
 * alfabeto de 31 es despreciable aquí, pero un generador predecible no lo
 * sería.
 */
export function newAccessCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/**
 * Lo que el panelista teclea, llevado a lo que hay guardado.
 *
 * La gente escribe el código con guion, con espacios, en minúsculas o con la
 * O de «Otro» donde iba un cero. Lo primero se arregla; lo segundo no, porque
 * el alfabeto no tiene ni O ni 0 justamente para que no haya duda.
 */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Para dictarlo y para enseñarlo: `ABCD-EFGH` se lee mejor que `ABCDEFGH`. */
export function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

function secret(): string {
  const value = process.env.BETTER_AUTH_SECRET?.trim();
  if (!value) throw new Error("BETTER_AUTH_SECRET is required");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Token de sesión: a quién identifica, hasta cuándo vale, y la firma. */
export function issueSession(panelistId: string): {
  token: string;
  expires: Date;
} {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const payload = `${panelistId}.${expires.getTime()}`;
  return { token: `${payload}.${sign(payload)}`, expires };
}

/**
 * El panelista que firma este token, o `null`.
 *
 * La comparación es en tiempo constante: comparar firmas con `===` filtra, por
 * el tiempo que tarda en fallar, cuántos bytes iniciales acertaste, y con eso
 * se puede reconstruir una firma válida byte a byte.
 */
export function readSession(token: string | undefined): string | null {
  if (!token) return null;

  const cut = token.lastIndexOf(".");
  if (cut === -1) return null;

  const payload = token.slice(0, cut);
  const given = Buffer.from(token.slice(cut + 1));
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length) return null;
  if (!timingSafeEqual(given, expected)) return null;

  const [panelistId, expiresAt] = payload.split(".");
  if (!panelistId || !expiresAt) return null;
  if (Number(expiresAt) < Date.now()) return null;

  return panelistId;
}

/*
  Límite de intentos, por proceso.

  Con 8·10¹¹ combinaciones la fuerza bruta no es la amenaza realista —lo es un
  código filtrado, y contra eso esto no protege—. Sirve para que nadie deje un
  script probando toda la noche, y para que un fallo repetido se note.

  Vive en memoria y no en base: se pierde en cada despliegue y no se comparte
  entre instancias. Es lo que hay sin montar infraestructura para un evento de
  un día, y prefiero decirlo aquí que fingir que es más de lo que es.
*/
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

/** Un acierto limpia el contador: quien entró bien no arrastra sus errores. */
export function clearAttempts(key: string): void {
  attempts.delete(key);
}
