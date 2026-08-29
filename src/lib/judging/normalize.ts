/*
  Cómo se juntan los puntajes de panelistas distintos.

  Todo aquí es puro: entra un arreglo de calificaciones y sale el ranking. Sin
  red, sin base de datos, sin sesión. Es a propósito —esto decide quién gana un
  hackathon y tiene que poder ejercitarse con datos inventados antes de que
  llegue el primer mentor.

  ── El problema ──────────────────────────────────────────────────────────────

  Sumar los totales ponderados y promediar no basta, por tres razones distintas
  que la gente suele mezclar:

  1. SEVERIDAD. Un panelista promedia 3.1 y otro 4.2 sobre el mismo material.
  2. RANGO. Uno usa todo el 1–5 y otro se mueve entre 3.5 y 4.5. El del rango
     ancho decide la competencia aunque su opinión no valga más: sus diferencias
     son las únicas que sobreviven al promedio.
  3. MUESTRA. A uno le tocaron los cuatro proyectos flojos. Su media es baja
     porque su mesa era peor, no porque sea severo.

  ── Lo que se corrige y lo que no ────────────────────────────────────────────

  Con panel COMPLETO (todos ven a todos), la severidad se cancela sola: restarle
  lo mismo a todos los equipos no cambia el orden. Lo único que distorsiona de
  verdad es el rango, y eso es exactamente lo que arregla dividir por la
  desviación. Centramos igual porque cuesta cero y porque un panel «completo»
  deja de serlo en cuanto un mentor se ausenta en el último equipo.

  Con panel INCOMPLETO hay que corregir también la severidad, y entonces hace
  falta que el reparto esté CONECTADO: que cualquier equipo se pueda encadenar
  con cualquier otro pasando por panelistas compartidos. Dos panelistas que
  nunca coinciden en un equipo son dos escalas incomparables; el cálculo no
  protesta y el resultado no significa nada. Por eso `connected` es un
  resultado que se muestra, no un detalle interno.

  La normalización NUNCA cruza sedes: se llama una vez por panel.
*/

import {
  CRITERIA,
  type CriterionKey,
  type RawScores,
  TIEBREAK_ORDER,
  weightedTotal,
} from "./rubric";

/**
 * Pseudo-observaciones del encogimiento.
 *
 * La desviación de un panelista que calificó seis equipos es una estimación
 * mala, y dividir por ella amplifica el ruido en vez de corregirlo. Se encoge
 * hacia la del panel entero: quien calificó a muchos conserva su propia escala,
 * quien calificó a pocos hereda la del grupo. A 5, un panelista necesita ~6
 * equipos para que pese más lo suyo que lo del panel.
 */
const SHRINKAGE = 5;

/**
 * Piso de la desviación. Un panelista que le puso lo mismo a todo el mundo
 * tiene σ≈0, y sin piso su única diferencia se convertiría en un z enorme.
 */
const SIGMA_FLOOR = 0.35;

/** Por debajo de esto, la media y la desviación del panelista son ruido. */
export const MIN_TEAMS_PER_PANELIST = 5;

/** Por debajo de esto, el puntaje del equipo depende demasiado de una persona. */
export const MIN_PANELISTS_PER_TEAM = 3;

/** σ por debajo de esto = no discriminó; su voto casi no cuenta tras normalizar. */
const FLAT_SIGMA = 0.4;

/** Correlación con el resto por debajo de esto = leyó otra rúbrica, o vio algo. */
const DISCORDANT_R = 0.3;

export type ScoreEntry = {
  panelistId: string;
  teamId: string;
  scores: RawScores;
};

export type PanelistFlag = "few-teams" | "flat" | "discordant";
export type TeamFlag = "few-panelists";

export type PanelistStat = {
  panelistId: string;
  teams: number;
  mean: number;
  sigma: number;
  /** La que se usa de verdad: encogida hacia el panel y con piso. */
  sigmaUsed: number;
  /** Correlación con el promedio de los demás. `null` si no hay solape. */
  agreement: number | null;
  flags: PanelistFlag[];
};

export type TeamResult = {
  teamId: string;
  /** Promedio de los z. Es el que rankea. */
  z: number;
  /** El z llevado a una escala legible: 50 = promedio del panel. */
  index: number;
  /** Promedio del total ponderado crudo, 0–5. Es el que se le enseña al equipo. */
  raw: number;
  /** Por criterio, promedio crudo 0–5. Feedback y desempate. */
  byCriterion: Record<CriterionKey, number>;
  panelists: number;
  /** Desviación de los z entre panelistas: alta = equipo polarizante. */
  spread: number;
  flags: TeamFlag[];
  rank: number;
};

export type PanelResult = {
  teams: TeamResult[];
  panelists: PanelistStat[];
  /** Todos los panelistas calificaron a todos los equipos. */
  complete: boolean;
  /**
   * El reparto permite comparar a todos con todos. Si es `false`, el ranking no
   * se puede publicar: hay equipos que no tienen ninguna cadena de panelistas
   * compartidos con los demás.
   */
  connected: boolean;
  /** Grupos de equipos incomunicados entre sí. Vacío cuando `connected`. */
  islands: string[][];
};

function averages(
  buckets: Record<CriterionKey, number[]>,
): Record<CriterionKey, number> {
  const out = {} as Record<CriterionKey, number>;
  for (const c of CRITERIA) out[c.key] = mean(buckets[c.key]);
  return out;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Desviación muestral (n−1). Con un solo dato no hay dispersión que medir. */
function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const ss = values.reduce((acc, v) => acc + (v - m) ** 2, 0);
  return Math.sqrt(ss / (values.length - 1));
}

function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length < 3) return null;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

/**
 * ¿Se puede comparar a todos con todos?
 *
 * Union-find sobre los equipos: dos equipos quedan unidos si algún panelista
 * calificó a los dos. Si al final hay más de un grupo, el panel está partido en
 * escalas independientes y no hay fórmula que las junte.
 */
function components(entries: ScoreEntry[], teamIds: string[]): string[][] {
  const parent = new Map<string, string>(teamIds.map((id) => [id, id]));

  function find(id: string): string {
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root) as string;
    // Compresión de caminos: la segunda vuelta ya es plana.
    let cursor = id;
    while (parent.get(cursor) !== root) {
      const next = parent.get(cursor) as string;
      parent.set(cursor, root);
      cursor = next;
    }
    return root;
  }

  function union(a: string, b: string) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  const byPanelist = new Map<string, string[]>();
  for (const entry of entries) {
    const list = byPanelist.get(entry.panelistId) ?? [];
    list.push(entry.teamId);
    byPanelist.set(entry.panelistId, list);
  }
  for (const teams of byPanelist.values()) {
    for (let i = 1; i < teams.length; i++) union(teams[0], teams[i]);
  }

  const groups = new Map<string, string[]>();
  for (const id of teamIds) {
    const root = find(id);
    const group = groups.get(root) ?? [];
    group.push(id);
    groups.set(root, group);
  }
  return [...groups.values()];
}

/**
 * Ranking normalizado de un panel.
 *
 * Un panel = un conjunto de calificaciones que SÍ se pueden comparar entre sí:
 * los mentores de una sede sobre los equipos de esa sede, o los jurados de la
 * final sobre todos los finalistas. Nunca las cinco sedes juntas.
 *
 * Solo deben entrar calificaciones enviadas y completas. Una fila a medias
 * sesga la media del panelista y con ella los z de todos sus equipos.
 */
export function normalizePanel(entries: ScoreEntry[]): PanelResult {
  const teamIds = [...new Set(entries.map((e) => e.teamId))];
  const panelistIds = [...new Set(entries.map((e) => e.panelistId))];

  if (entries.length === 0) {
    return {
      teams: [],
      panelists: [],
      complete: false,
      connected: true,
      islands: [],
    };
  }

  // 1. Total ponderado crudo de cada calificación, en escala 0–5.
  const totals = new Map<string, number>();
  const key = (panelistId: string, teamId: string) =>
    `${panelistId}::${teamId}`;
  for (const entry of entries) {
    totals.set(
      key(entry.panelistId, entry.teamId),
      weightedTotal(entry.scores),
    );
  }

  // 2. Estadísticos por panelista, con la desviación encogida hacia el panel.
  const panelSigma = stdev([...totals.values()]);
  const byPanelist = new Map<string, ScoreEntry[]>();
  for (const entry of entries) {
    const list = byPanelist.get(entry.panelistId) ?? [];
    list.push(entry);
    byPanelist.set(entry.panelistId, list);
  }

  const stats = new Map<string, PanelistStat>();
  for (const [panelistId, list] of byPanelist) {
    const values = list.map(
      (e) => totals.get(key(panelistId, e.teamId)) as number,
    );
    const n = values.length;
    const sigma = stdev(values);
    const shrunk =
      n > 1
        ? Math.sqrt(
            ((n - 1) * sigma ** 2 + SHRINKAGE * panelSigma ** 2) /
              (n - 1 + SHRINKAGE),
          )
        : panelSigma;

    stats.set(panelistId, {
      panelistId,
      teams: n,
      mean: mean(values),
      sigma,
      sigmaUsed: Math.max(shrunk, SIGMA_FLOOR),
      agreement: null,
      flags: [],
    });
  }

  // 3. Normalizar cada calificación contra la escala de quien la puso.
  const zByTeam = new Map<string, number[]>();
  for (const entry of entries) {
    const stat = stats.get(entry.panelistId) as PanelistStat;
    const total = totals.get(key(entry.panelistId, entry.teamId)) as number;
    const z = (total - stat.mean) / stat.sigmaUsed;
    const list = zByTeam.get(entry.teamId) ?? [];
    list.push(z);
    zByTeam.set(entry.teamId, list);
  }

  // 4. Banderas del panelista. La concordancia se mide contra el promedio de
  //    los demás sobre los equipos que comparten, no contra el resultado final
  //    —que ya incluye su propio voto y se auto-confirmaría.
  const rawByTeam = new Map<string, number[]>();
  for (const entry of entries) {
    const list = rawByTeam.get(entry.teamId) ?? [];
    list.push(totals.get(key(entry.panelistId, entry.teamId)) as number);
    rawByTeam.set(entry.teamId, list);
  }

  for (const [panelistId, list] of byPanelist) {
    const stat = stats.get(panelistId) as PanelistStat;
    const mine: number[] = [];
    const others: number[] = [];
    for (const entry of list) {
      const all = rawByTeam.get(entry.teamId) as number[];
      if (all.length < 2) continue;
      const own = totals.get(key(panelistId, entry.teamId)) as number;
      mine.push(own);
      others.push((all.reduce((a, b) => a + b, 0) - own) / (all.length - 1));
    }
    stat.agreement = pearson(mine, others);

    if (stat.teams < MIN_TEAMS_PER_PANELIST) stat.flags.push("few-teams");
    if (stat.teams >= 2 && stat.sigma < FLAT_SIGMA) stat.flags.push("flat");
    if (stat.agreement !== null && stat.agreement < DISCORDANT_R) {
      stat.flags.push("discordant");
    }
  }

  // 5. Resultado por equipo.
  const byCriterionSums = new Map<string, Record<CriterionKey, number[]>>();
  function emptyBuckets(): Record<CriterionKey, number[]> {
    const buckets = {} as Record<CriterionKey, number[]>;
    for (const c of CRITERIA) buckets[c.key] = [];
    return buckets;
  }
  for (const entry of entries) {
    const acc = byCriterionSums.get(entry.teamId) ?? emptyBuckets();
    for (const c of CRITERIA) acc[c.key].push(entry.scores[c.key]);
    byCriterionSums.set(entry.teamId, acc);
  }

  const teams: TeamResult[] = teamIds.map((teamId) => {
    const zs = zByTeam.get(teamId) as number[];
    const z = mean(zs);
    const criterion = byCriterionSums.get(teamId) as Record<
      CriterionKey,
      number[]
    >;
    return {
      teamId,
      z,
      index: Math.round(50 + 10 * z),
      raw: mean(rawByTeam.get(teamId) as number[]),
      byCriterion: averages(criterion),
      panelists: zs.length,
      spread: stdev(zs),
      flags: zs.length < MIN_PANELISTS_PER_TEAM ? ["few-panelists"] : [],
      rank: 0,
    };
  });

  // 6. Orden y desempate, en la cadena que se fijó antes de ver resultados.
  teams.sort((a, b) => {
    if (b.z !== a.z) return b.z - a.z;
    if (b.raw !== a.raw) return b.raw - a.raw;
    for (const criterion of TIEBREAK_ORDER) {
      const diff = b.byCriterion[criterion] - a.byCriterion[criterion];
      if (diff !== 0) return diff;
    }
    // Consenso sobre polarizante: a igualdad de todo, gana el que dividió menos.
    if (a.spread !== b.spread) return a.spread - b.spread;
    return a.teamId.localeCompare(b.teamId);
  });
  teams.forEach((team, i) => {
    team.rank = i + 1;
  });

  const islands = components(entries, teamIds);
  const complete = panelistIds.every(
    (id) => (byPanelist.get(id)?.length ?? 0) === teamIds.length,
  );

  return {
    teams,
    panelists: [...stats.values()].sort((a, b) => b.teams - a.teams),
    complete,
    connected: islands.length <= 1,
    islands: islands.length > 1 ? islands : [],
  };
}
