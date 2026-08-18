export type EventRole = "mentor" | "judge";

type RoleDetails = {
  noun: string;
  label: string;
  headline: string;
  introduction: string;
  contribution: string;
  schedule: readonly [label: string, value: string][];
  expectations: readonly string[];
  logisticsNote: string;
};

export const eventDetails = {
  name: "The Next Craft",
  date: "Sábado 29 de agosto de 2026",
  eventWindow: "09:00-21:00 (UTC-5)",
  format: "Presencial · cinco sedes en Latinoamérica",
  siteUrl: "https://thenextcraft.org",
} as const;

export const roleDetails: Record<EventRole, RoleDetails> = {
  mentor: {
    noun: "mentor",
    label: "MENTOR OFICIAL",
    headline: "Queremos que acompañes a quienes están construyendo lo próximo.",
    introduction:
      "Crafter Station tiene el gusto de invitarte formalmente a participar como mentor oficial de The Next Craft, una hackathon presencial que reunirá a 300 builders trabajando en simultáneo desde cinco ciudades de Latinoamérica.",
    contribution:
      "Tu experiencia ayudará a los equipos a convertir decisiones difíciles de producto e ingeniería en software real, funcional y listo para demostrar.",
    schedule: [
      ["FECHA", "Sábado 29 de agosto de 2026"],
      ["SEDE", "Lima · ubicación final por confirmar"],
      ["MENTORÍAS", "Desde las 11:00 · bloque final por coordinar"],
      ["EVENTO", "09:00-21:00 (UTC-5)"],
    ],
    expectations: [
      "Conversar con equipos en sesiones breves y enfocadas.",
      "Dar feedback práctico sobre producto, arquitectura y ejecución.",
      "Ayudar a desbloquear decisiones sin construir por el equipo.",
    ],
    logisticsNote:
      "La dirección de la sede, acreditación y bloque exacto de mentorías se compartirán directamente antes del evento.",
  },
  judge: {
    noun: "jurado",
    label: "JURADO OFICIAL",
    headline:
      "Queremos tu criterio detrás de los productos que lleguen más lejos.",
    introduction:
      "Crafter Station tiene el gusto de invitarte formalmente a participar como jurado oficial de The Next Craft, una hackathon presencial que reunirá a 300 builders trabajando en simultáneo desde cinco ciudades de Latinoamérica.",
    contribution:
      "Tu criterio será clave para reconocer productos útiles, técnicamente sólidos y ejecutados con ambición dentro de una jornada de doce horas.",
    schedule: [
      ["FECHA", "Sábado 29 de agosto de 2026"],
      ["SEDE", "Lima · ubicación final por confirmar"],
      ["DEMOS", "Desde las 20:15"],
      ["EVENTO", "09:00-21:00 (UTC-5)"],
    ],
    expectations: [
      "Revisar demos y productos funcionales.",
      "Evaluar cada proyecto con la rúbrica oficial.",
      "Participar en la deliberación y selección final.",
    ],
    logisticsNote:
      "La dirección de la sede, acreditación, rúbrica y dinámica de evaluación se compartirán directamente antes del evento.",
  },
};

export const organizers = [
  {
    name: "Shiara Arauzo",
    title: "Co-founder",
    organization: "Crafter Station",
  },
  {
    name: "Anthony Cueva",
    title: "Co-founder",
    organization: "Crafter Station",
  },
] as const;
