import type { CityKey } from "@/lib/cities";
import type { TrackKey } from "@/lib/db/schema-types";

import { TRACKS, trackIndex } from "./content";

/**
 * Cuántos equipos admite cada sede en el reto.
 *
 * ⚠️ CIFRAS PROVISIONALES. Son un marcador de posición mientras se define el
 * aforo real de cada sede — 20 sale de repartir los ~300 asistentes entre las
 * cinco sedes y agruparlos de 3 a 5. Lima y El Salvador no tienen el mismo
 * tamaño, así que casi seguro estos números hay que tocarlos uno a uno.
 *
 * Cambiar aquí es suficiente: el reparto por track y el bloqueo al confirmar
 * salen de este objeto.
 */
export const HUB_TEAM_CAPACITY: Record<CityKey, number> = {
  lima: 20,
  bogota: 20,
  guatemala: 20,
  arequipa: 20,
  salvador: 20,
};

/** Cupo total de la sede. `null` cuando el equipo no tiene sede asignada. */
export function hubCapacity(city: CityKey | null): number | null {
  return city ? HUB_TEAM_CAPACITY[city] : null;
}

/**
 * El cupo de una sede repartido entre los tres tracks.
 *
 * El resto se reparte de uno en uno empezando por el primer track, no con un
 * redondeo: así los tres sumandos suman exactamente el cupo de la sede. Con 20
 * salen 7, 7 y 6 — con `Math.ceil` saldrían 7, 7 y 7, que son 21 y dejan
 * entrar a un equipo de más; con `Math.floor`, 6, 6 y 6, que dejan dos plazas
 * inalcanzables.
 */
export function trackCapacity(
  city: CityKey | null,
  track: TrackKey,
): number | null {
  const total = hubCapacity(city);
  if (total === null) return null;

  const base = Math.floor(total / TRACKS.length);
  const remainder = total % TRACKS.length;
  return base + (trackIndex(track) < remainder ? 1 : 0);
}

/** El cupo de los tres tracks de una sede, en el orden de `TRACKS`. */
export function trackCapacities(
  city: CityKey | null,
): Map<TrackKey, number | null> {
  return new Map(TRACKS.map((t) => [t.key, trackCapacity(city, t.key)]));
}
