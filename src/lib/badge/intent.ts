/**
 * Con qué intención se entra al Badge Studio teniendo ya un badge.
 *
 * El estudio redirige al panel a quien llega con el badge hecho, así que la
 * única forma de volver a entrar es declarando a qué: `?edit=photo` para
 * reemplazar la foto, `?edit=profile` para tocar nombre, bio o enlaces.
 * Vive suelto porque lo leen la página (servidor), el panel y el propio
 * estudio (cliente).
 */
export type BadgeStudioIntent = "photo" | "profile" | null;

export function parseStudioIntent(value: unknown): BadgeStudioIntent {
  return value === "photo" || value === "profile" ? value : null;
}

/**
 * Enlace de vuelta al estudio desde el panel. Sin prefijo de idioma: lo pone
 * el `Link` de `@/i18n/navigation`.
 */
export function badgeStudioPath(intent: BadgeStudioIntent) {
  return intent ? `/badge?edit=${intent}` : "/badge";
}
