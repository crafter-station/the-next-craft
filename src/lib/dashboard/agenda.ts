import { AGENDA_META, type AgendaMeta, agendaMetaByTime } from "./content";

/** Forma de `schedule.events[]` en src/messages/{es,en}.json. */
export type ScheduleMessage = {
  time: string;
  description: string;
  mono?: string;
  highlight?: boolean;
};

export type AgendaBlock = AgendaMeta & {
  description: string;
  mono?: string;
};

/**
 * Une el texto canónico de la landing con los metadatos operativos del
 * dashboard. Si algún día se añade un bloque a los mensajes sin metadatos,
 * se ignora aquí en vez de romper la página.
 */
export function buildAgenda(events: ScheduleMessage[]): AgendaBlock[] {
  const blocks: AgendaBlock[] = [];
  for (const meta of AGENDA_META) {
    const message = events.find((e) => e.time === meta.time);
    if (!message) continue;
    blocks.push({
      ...meta,
      description: message.description,
      mono: message.mono,
    });
  }
  return blocks;
}

export function isKnownBlock(time: string) {
  return agendaMetaByTime.has(time);
}
