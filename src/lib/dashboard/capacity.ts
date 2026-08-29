import type { CityKey } from "@/lib/cities";
import type { TrackKey } from "@/lib/db/schema-types";

import { TRACKS } from "./content";

/**
 * Cuántos equipos puede llevar un track por encima del reparto perfecto antes
 * de cerrarse.
 *
 * Es la única perilla de todo esto. A 0 el reparto sería un turno rotatorio
 * estricto —el segundo equipo de la sede ya no podría repetir track— y eso se
 * vive como arbitrario cuando en la sala hay cuatro equipos. A 2 los primeros
 * pueden agruparse donde quieran y el freno solo aprieta cuando ya hay
 * suficientes equipos para que el desequilibrio importe.
 */
export const TRACK_BALANCE_SLACK = 2;

/**
 * El techo de un track en su sede, dado cuántos equipos llevan track
 * confirmado allí.
 *
 * No hay cupo total: cuántos equipos habrá no se sabe hasta que se forman, y
 * los equipos se forman durante el propio kickoff. Así que el límite no es un
 * número puesto a mano, sino el reparto equitativo de lo que exista **en ese
 * momento**, más el margen de arriba. Crece solo según entra gente.
 *
 * Se cuenta `confirmados + 1` porque el equipo que está confirmando ahora
 * todavía no está en el recuento y sí ocupa sitio en el reparto.
 */
export function trackLimit(confirmedInHub: number): number {
  return (
    Math.ceil((confirmedInHub + 1) / TRACKS.length) + TRACK_BALANCE_SLACK
  );
}

/** Los tres tracks de una sede con su recuento y su techo de ahora mismo. */
export function trackBalance(
  counts: Map<TrackKey, number>,
): Map<TrackKey, { teams: number; limit: number }> {
  const confirmedInHub = [...counts.values()].reduce((a, b) => a + b, 0);
  const limit = trackLimit(confirmedInHub);
  return new Map(
    TRACKS.map((t) => [t.key, { teams: counts.get(t.key) ?? 0, limit }]),
  );
}

/** Sin sede no hay contra qué equilibrar, y no bloqueamos por eso. */
export function balanceApplies(city: CityKey | null): city is CityKey {
  return city !== null;
}
