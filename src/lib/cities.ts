/*
  Sedes del evento. Cada una tiene su propio evento en Luma: el registro no es
  único, se elige ciudad. `key` indexa las traducciones en `cities.*`.

  Orden = el mismo que usa el resto del copy (hero, footer, FAQ).
*/
export const CITIES = [
  { key: "lima", luma: "https://luma.com/b6hqjpzd" },
  { key: "bogota", luma: "https://luma.com/hack0-a0d4" },
  { key: "guatemala", luma: "https://luma.com/hack0-855j" },
  { key: "arequipa", luma: "https://luma.com/hack0-4yv5" },
  { key: "salvador", luma: "https://luma.com/hack0-q2my" },
] as const;

export type CityKey = (typeof CITIES)[number]["key"];

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
