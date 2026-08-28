/*
  Sedes del evento. Cada una tiene su propio evento en Luma: el registro no es
  único, se elige ciudad. `key` indexa las traducciones en `cities.*`.

  Orden = el mismo que usa el resto del copy (hero, footer, FAQ).

  `utcOffset` es fijo a propósito: ninguno de estos cuatro países aplica horario
  de verano (Perú, Colombia, Guatemala y El Salvador lo tienen abolido), así que
  el desfase no cambia en el año y se puede construir un instante concatenando
  la hora local con el offset. `timeZone` va aparte porque `Intl` lo necesita
  para formatear.

  Las cinco sedes NO están en la misma hora: Lima, Bogotá y Arequipa van a -05,
  Guatemala y El Salvador a -06. La agenda son horas locales de cada sede —las
  09:00 de Guatemala no son las 09:00 de Lima— y todo el cálculo del dashboard
  tiene que resolverse contra la sede del hacker, no contra una global.
*/
export const CITIES = [
  {
    key: "lima",
    luma: "https://luma.com/b6hqjpzd",
    timeZone: "America/Lima",
    utcOffset: "-05:00",
  },
  {
    key: "bogota",
    luma: "https://luma.com/hack0-a0d4",
    timeZone: "America/Bogota",
    utcOffset: "-05:00",
  },
  {
    key: "guatemala",
    luma: "https://luma.com/hack0-855j",
    timeZone: "America/Guatemala",
    utcOffset: "-06:00",
  },
  {
    key: "arequipa",
    luma: "https://luma.com/hack0-4yv5",
    timeZone: "America/Lima",
    utcOffset: "-05:00",
  },
  {
    key: "salvador",
    luma: "https://luma.com/hack0-q2my",
    timeZone: "America/El_Salvador",
    utcOffset: "-06:00",
  },
] as const;

export type CityKey = (typeof CITIES)[number]["key"];

/**
 * Sede por defecto para cuando no se sabe cuál es: un participante sin ciudad,
 * o un visitante anónimo de la landing. Es la primera del orden canónico.
 */
export const DEFAULT_CITY: CityKey = "lima";

const CITY_BY_KEY = new Map(CITIES.map((c) => [c.key, c]));

function cityOrDefault(city: CityKey | null | undefined) {
  return CITY_BY_KEY.get(city ?? DEFAULT_CITY) ?? CITY_BY_KEY.get(DEFAULT_CITY);
}

/** Zona IANA de la sede, para `Intl`. */
export function cityTimeZone(city: CityKey | null | undefined): string {
  return cityOrDefault(city)?.timeZone ?? "America/Lima";
}

/** Desfase fijo de la sede, para construir instantes desde una hora local. */
export function cityUtcOffset(city: CityKey | null | undefined): string {
  return cityOrDefault(city)?.utcOffset ?? "-05:00";
}

/** Etiqueta corta del reloj: «GMT-5», «GMT-6». */
export function cityClockLabel(city: CityKey | null | undefined): string {
  const offset = cityUtcOffset(city);
  const hours = Number(offset.slice(0, 3));
  return `GMT${hours >= 0 ? "+" : "-"}${Math.abs(hours)}`;
}

/** La sede cuya zona coincide con la del navegador, si alguna. */
export function cityForTimeZone(timeZone: string): CityKey | null {
  return CITIES.find((c) => c.timeZone === timeZone)?.key ?? null;
}

const CITY_NAMES: Record<CityKey, Record<"es" | "en", string>> = {
  lima: { es: "Lima", en: "Lima" },
  bogota: { es: "Bogotá", en: "Bogotá" },
  guatemala: { es: "Ciudad de Guatemala", en: "Guatemala City" },
  arequipa: { es: "Arequipa", en: "Arequipa" },
  salvador: { es: "El Salvador", en: "El Salvador" },
};

export function cityName(city: CityKey, locale: string) {
  return CITY_NAMES[city][locale === "en" ? "en" : "es"];
}
