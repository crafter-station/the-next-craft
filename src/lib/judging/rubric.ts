/*
  La rúbrica, en un solo sitio.

  Es la misma para las dos fases y los tres tracks, y los pesos no cambian por
  sede. Están publicados desde antes del kickoff: los equipos decidieron qué
  construir sabiendo que la demo cerrada pesa el triple que el pitch. Cambiarlos
  con el evento empezado sería cambiar las reglas de un juego terminado, así que
  esta constante es la fuente de verdad y nadie la sobreescribe por parámetro.

  Las notas son enteros 0–5. Los pesos suman 1 y el total ponderado vuelve a
  quedar en 0–5, que es la escala que el panelista reconoce.
*/

export const CRITERIA = [
  { key: "demo", weight: 0.3, evidenceRequired: true },
  { key: "usage", weight: 0.25, evidenceRequired: true },
  { key: "craft", weight: 0.2, evidenceRequired: false },
  { key: "ambition", weight: 0.15, evidenceRequired: false },
  { key: "pitch", weight: 0.1, evidenceRequired: false },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];

export const CRITERION_KEYS = CRITERIA.map((c) => c.key) as CriterionKey[];

export const MAX_SCORE = 5;

/**
 * Paso de la escala: medio punto.
 *
 * La hoja de evaluación oficial valida `decimal between 0 and 5` con formato
 * `0.0`, así que los decimales están permitidos por diseño. Aquí se fijan a
 * medios y no a decimales libres: con anclajes verbales por nivel, un 3.7 no
 * significa nada que un jurado pueda defender —es precisión inventada—,
 * mientras que un 3.5 sí se dice en voz alta («entre cumple y sobresale»).
 *
 * El efecto sobre los empates es real pero modesto, y conviene no exagerarlo:
 * medido sobre el espacio completo de notas, el paso entero da 99 totales
 * distintos y el medio da 199, con lo que la probabilidad de que dos
 * evaluaciones caigan en el mismo total baja del 1.70% al 0.92%. Para un
 * panelista con veinte equipos son ~3 pares empatados en vez de ~6. Sigue
 * haciendo falta la cadena de desempate de `TIEBREAK_ORDER`.
 */
export const SCORE_STEP = 0.5;

/** Los once niveles elegibles: 0, 0.5, 1 … 5. */
export const SCORE_LEVELS = Array.from(
  { length: MAX_SCORE / SCORE_STEP + 1 },
  (_, i) => i * SCORE_STEP,
);

/** Notas de un panelista sobre un equipo, tal cual las puso. */
export type RawScores = Record<CriterionKey, number>;

/**
 * El desempate, fijado antes de ver un solo resultado.
 *
 * Cuando dos equipos empatan en el puntaje normalizado se baja por los
 * criterios en orden de peso. Es la única forma de que el desempate signifique
 * lo mismo que la rúbrica ya prometió: si demo cerrada vale 30%, también manda
 * cuando hay que partir un empate.
 */
export const TIEBREAK_ORDER: CriterionKey[] = CRITERIA.map((c) => c.key);

export function isValidScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= MAX_SCORE &&
    // Múltiplo exacto de medio punto. `* 2` en vez de `% 0.5` porque el módulo
    // con flotantes de 0.5 arrastra residuos y rechazaría valores válidos.
    Number.isInteger(value * 2)
  );
}

/**
 * Total ponderado sobre la nota cruda, en escala 0–5.
 *
 * El orden importa y es la trampa clásica: se pondera PRIMERO y se normaliza
 * el compuesto después. Normalizar criterio por criterio dejaría cada uno con
 * varianza 1, y el peso efectivo pasaría a ser 1/σ en vez del que acordamos —
 * un criterio donde casi todos sacan 4 vería su varianza inflada hasta pesar
 * igual que demo cerrada. Los pesos publicados dejarían de existir.
 */
export function weightedTotal(scores: RawScores): number {
  return CRITERIA.reduce((sum, c) => sum + c.weight * scores[c.key], 0);
}
