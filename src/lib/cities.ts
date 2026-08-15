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
